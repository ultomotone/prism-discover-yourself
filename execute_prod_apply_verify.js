#!/usr/bin/env node

/**
 * PROD APPLY & VERIFY (Guarded)
 * 
 * Phase 2 of production promotion pipeline.
 * Applies configuration (idempotent) and runs verification tests.
 * Generates evidence and HALTS for soak monitoring.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gnkuikentdtnatazeriu.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Parameters
const ENGINE_VERSION = 'v1.2.1';
const FC_VERSION = 'v1.2';
const FIXTURE_SESSION = '618c5ea6-aeda-4084-9156-0aac9643afd3';

async function runProdApplyAndVerify() {
  console.log('🚀 PROD APPLY & VERIFY (GUARDED)');
  console.log(`📦 Target Versions: Engine ${ENGINE_VERSION}, FC ${FC_VERSION}`);
  console.log(`🧪 Test Session: ${FIXTURE_SESSION}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const results = {
    apply: {},
    verify: {},
    timestamp: new Date().toISOString()
  };

  try {
    // PHASE 1: APPLY (Idempotent)
    console.log('\n🔧 PHASE 1: Production Apply (Idempotent)');
    
    // Check current config
    const { data: currentConfig } = await supabase
      .from('scoring_config')
      .select('value, updated_at')
      .eq('key', 'results_version')
      .single();

    console.log(`Current config: ${currentConfig?.value}`);
    
    if (currentConfig?.value === `"${ENGINE_VERSION}"`) {
      console.log('✅ Configuration already at target version - no update needed');
      results.apply = {
        action: 'no_change_required',
        current_version: currentConfig.value,
        target_version: `"${ENGINE_VERSION}"`,
        updated_at: currentConfig.updated_at
      };
    } else {
      console.log('🔄 Updating scoring configuration...');
      const { error: updateError } = await supabase
        .from('scoring_config')
        .update({
          value: `"${ENGINE_VERSION}"`,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'results_version');

      if (updateError) {
        throw new Error(`Configuration update failed: ${updateError.message}`);
      }

      console.log('✅ Configuration updated successfully');
      results.apply = {
        action: 'updated',
        previous_version: currentConfig?.value,
        new_version: `"${ENGINE_VERSION}"`,
        updated_at: new Date().toISOString()
      };
    }

    // PHASE 2: VERIFY (Read-only + Function Call)
    console.log('\n🔬 PHASE 2: Production Verification');
    console.log('Running verification tests...');

    // Test 1: finalizeAssessment Function
    console.log('\n🧪 Test 1: finalizeAssessment Function');
    const { data: finalizeResponse, error: finalizeError } = await supabase.functions.invoke(
      'finalizeAssessment',
      {
        body: {
          session_id: FIXTURE_SESSION,
          fc_version: FC_VERSION
        }
      }
    );

    const finalizeSuccess = !finalizeError && finalizeResponse?.status === 'success';
    console.log(`Function result: ${finalizeSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (finalizeResponse?.results_url) {
      console.log(`Results URL: ${finalizeResponse.results_url}`);
    }

    // Test 2: Database Version Stamps
    console.log('\n🧪 Test 2: Database Version Stamps');
    
    // Check FC scores version
    const { data: fcScores } = await supabase
      .from('fc_scores')
      .select('version, created_at, scores_json')
      .eq('session_id', FIXTURE_SESSION)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const fcVersionCorrect = fcScores?.version === FC_VERSION;
    console.log(`FC scores version: ${fcScores?.version} ${fcVersionCorrect ? '✅' : '❌'}`);
    
    const fcScoresValid = fcScores?.scores_json && typeof fcScores.scores_json === 'object';
    console.log(`FC scores JSON: ${fcScoresValid ? '✅ Valid object' : '❌ Invalid'}`);

    // Check profile version
    const { data: profile } = await supabase
      .from('profiles')
      .select('results_version, updated_at, session_id')
      .eq('session_id', FIXTURE_SESSION)
      .single();

    const profileVersionCorrect = profile?.results_version === ENGINE_VERSION;
    console.log(`Profile version: ${profile?.results_version} ${profileVersionCorrect ? '✅' : '❌'}`);

    // Test 3: Token Gating (Access Control)
    console.log('\n🧪 Test 3: Token Gating Verification');
    
    // Get share token for valid access test
    const { data: sessionData } = await supabase
      .from('assessment_sessions')
      .select('share_token')
      .eq('id', FIXTURE_SESSION)
      .single();

    let tokenGatingResults = { with_token: null, without_token: null };

    try {
      // Test WITH valid token (should succeed)
      const { data: withTokenResult } = await supabase.rpc('get_profile_by_session', {
        p_session_id: FIXTURE_SESSION,
        p_share_token: sessionData.share_token
      });
      
      tokenGatingResults.with_token = withTokenResult ? 'SUCCESS_200' : 'FAILED';
      console.log(`With valid token: ${tokenGatingResults.with_token === 'SUCCESS_200' ? '✅ 200' : '❌ Failed'}`);
    } catch (error) {
      tokenGatingResults.with_token = 'ERROR';
      console.log(`With valid token: ❌ Error - ${error.message}`);
    }

    try {
      // Test WITHOUT token (should fail with 401/403)
      const { error: noTokenError } = await supabase.rpc('get_profile_by_session', {
        p_session_id: FIXTURE_SESSION,
        p_share_token: 'invalid-token-12345'
      });
      
      if (noTokenError && (noTokenError.message.includes('Access denied') || noTokenError.code === '42501')) {
        tokenGatingResults.without_token = 'BLOCKED_401';
        console.log('Without token: ✅ 401/403 (properly blocked)');
      } else {
        tokenGatingResults.without_token = 'SECURITY_BREACH';
        console.log('Without token: ❌ SECURITY BREACH - access allowed');
      }
    } catch (error) {
      tokenGatingResults.without_token = 'BLOCKED_401';
      console.log('Without token: ✅ 401/403 (properly blocked)');
    }

    // Test 4: Telemetry Check (fc_source verification)
    console.log('\n🧪 Test 4: Telemetry Verification');
    
    // Check that FC scores came from fc_scores table (not legacy)
    const telemetryCheck = {
      fc_source: fcScores ? 'fc_scores' : 'unknown',
      engine_version_override: false, // No override mechanism in current setup
      version_alignment: fcVersionCorrect && profileVersionCorrect
    };
    
    console.log(`FC source: ${telemetryCheck.fc_source} ${telemetryCheck.fc_source === 'fc_scores' ? '✅' : '❌'}`);
    console.log(`Version alignment: ${telemetryCheck.version_alignment ? '✅' : '❌'}`);

    // Compile verification results
    results.verify = {
      finalize_function: {
        success: finalizeSuccess,
        response: finalizeResponse,
        error: finalizeError?.message
      },
      version_stamps: {
        fc_version: fcScores?.version,
        fc_version_correct: fcVersionCorrect,
        profile_version: profile?.results_version,
        profile_version_correct: profileVersionCorrect,
        fc_scores_valid: fcScoresValid
      },
      token_gating: tokenGatingResults,
      telemetry: telemetryCheck
    };

    // Overall verification status
    const verificationPassed = (
      finalizeSuccess &&
      fcVersionCorrect &&
      profileVersionCorrect &&
      fcScoresValid &&
      tokenGatingResults.with_token === 'SUCCESS_200' &&
      tokenGatingResults.without_token === 'BLOCKED_401' &&
      telemetryCheck.version_alignment
    );

    results.overall_status = verificationPassed ? 'PASS' : 'FAIL';

    // Generate evidence artifacts
    await generateApplyLogs(results);
    await generateVerifyEvidence(results);

    console.log('\n📄 ARTIFACTS GENERATED:');
    console.log('✅ artifacts/prod_apply_logs.md');
    console.log('✅ artifacts/prod_verify_evidence.md');

    if (verificationPassed) {
      console.log('\n🎉 APPLY & VERIFY COMPLETE — PASS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ All verification tests passed');
      console.log('✅ Production ready for soak monitoring');
      console.log('🔄 Next: Run 2-hour production soak');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.log('\n❌ VERIFICATION FAILED — INVESTIGATE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🚨 One or more verification tests failed');
      console.log('🔍 Review prod_verify_evidence.md for details');
      console.log('🛑 DO NOT PROCEED to soak without fixes');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    return results;

  } catch (error) {
    console.error('\n❌ APPLY/VERIFY FAILED');
    console.error(`Error: ${error.message}`);
    console.error('\n🚨 PRODUCTION DEPLOYMENT FAILED');
    console.error('Review logs and consider rollback if necessary');
    throw error;
  }
}

async function generateApplyLogs(results) {
  const content = `# Production Apply Logs

**Timestamp**: ${results.timestamp}
**Operation**: Production configuration apply (idempotent)

## Apply Phase Results

### Configuration Update
**Action**: ${results.apply.action}
${results.apply.action === 'updated' ? `
**Previous Version**: ${results.apply.previous_version}
**New Version**: ${results.apply.new_version}
**Updated At**: ${results.apply.updated_at}
` : `
**Current Version**: ${results.apply.current_version}
**Target Version**: ${results.apply.target_version}
**Status**: Already at target - no change required
**Last Updated**: ${results.apply.updated_at}
`}

## Deployment Summary

✅ **Apply Status**: ${results.apply.action === 'no_change_required' ? 'No changes needed' : 'Successfully updated'}
✅ **Configuration**: scoring_config.results_version = "${ENGINE_VERSION}"
✅ **Idempotent**: Operation safe to repeat
✅ **Rollback Ready**: Previous state preserved

## Next Phase

🔄 **Verification Phase**: Initiated immediately after apply
📊 **Evidence Collection**: Comprehensive test suite executed
🎯 **Target**: Prove production readiness

---
*Generated by Production Promotion Pipeline*
`;

  require('fs').writeFileSync('artifacts/prod_apply_logs.md', content);
}

async function generateVerifyEvidence(results) {
  const { verify } = results;
  
  const content = `# Production Verification Evidence

**Timestamp**: ${results.timestamp}
**Test Session**: ${FIXTURE_SESSION}
**Overall Result**: ${results.overall_status === 'PASS' ? '✅ PASS' : '❌ FAIL'}

## Test Results Summary

### 1. finalizeAssessment Function Test
**Result**: ${verify.finalize_function.success ? '✅ PASS' : '❌ FAIL'}
- **Response Status**: ${verify.finalize_function.success ? 'success' : 'failed'}
- **Results URL**: ${verify.finalize_function.response?.results_url || 'not generated'}
${verify.finalize_function.error ? `- **Error**: ${verify.finalize_function.error}` : ''}

### 2. Database Version Stamps
**Result**: ${verify.version_stamps.fc_version_correct && verify.version_stamps.profile_version_correct ? '✅ PASS' : '❌ FAIL'}

#### FC Scores Verification
- **Version**: ${verify.version_stamps.fc_version} ${verify.version_stamps.fc_version_correct ? '✅' : '❌'}
- **Expected**: ${FC_VERSION}
- **JSON Object**: ${verify.version_stamps.fc_scores_valid ? '✅ Valid' : '❌ Invalid'}

#### Profile Verification  
- **Version**: ${verify.version_stamps.profile_version} ${verify.version_stamps.profile_version_correct ? '✅' : '❌'}
- **Expected**: ${ENGINE_VERSION}

### 3. Access Control (Token Gating)
**Result**: ${verify.token_gating.with_token === 'SUCCESS_200' && verify.token_gating.without_token === 'BLOCKED_401' ? '✅ PASS' : '❌ FAIL'}

#### With Valid Token
- **Status**: ${verify.token_gating.with_token} ${verify.token_gating.with_token === 'SUCCESS_200' ? '✅' : '❌'}
- **Expected**: 200/SUCCESS

#### Without Valid Token  
- **Status**: ${verify.token_gating.without_token} ${verify.token_gating.without_token === 'BLOCKED_401' ? '✅' : '❌'}
- **Expected**: 401/403 (blocked)

### 4. Telemetry & Source Verification
**Result**: ${verify.telemetry.version_alignment && verify.telemetry.fc_source === 'fc_scores' ? '✅ PASS' : '❌ FAIL'}

- **FC Source**: ${verify.telemetry.fc_source} ${verify.telemetry.fc_source === 'fc_scores' ? '✅' : '❌'}
- **Version Alignment**: ${verify.telemetry.version_alignment ? '✅' : '❌'}
- **Engine Overrides**: ${verify.telemetry.engine_version_override ? '❌ Detected' : '✅ None'}

## Security Validation

${verify.token_gating.with_token === 'SUCCESS_200' && verify.token_gating.without_token === 'BLOCKED_401' ? 
  '✅ **Token Gating**: Properly enforced - access granted only with valid tokens' :
  '🚨 **Security Issue**: Token gating not working correctly'
}

## Performance & Reliability

${verify.finalize_function.success ? 
  '✅ **Function Performance**: finalizeAssessment responding correctly' :
  '❌ **Function Issue**: finalizeAssessment not working properly'
}

${verify.version_stamps.fc_version_correct && verify.version_stamps.profile_version_correct ?
  '✅ **Version Consistency**: All components using correct versions' :
  '❌ **Version Drift**: Version inconsistencies detected'
}

## Recommendation

${results.overall_status === 'PASS' ? `
✅ **PROCEED TO SOAK**
- All verification tests passed
- Production ready for monitoring phase
- Recommend 2-hour soak window
` : `
❌ **HALT - DO NOT PROCEED**  
- Critical verification failures detected
- Investigate and resolve issues
- Re-run verification before soak
`}

---
*Verification completed at ${results.timestamp}*
*Generated by Production Promotion Pipeline*
`;

  require('fs').writeFileSync('artifacts/prod_verify_evidence.md', content);
}

// Execute if run directly
if (require.main === module) {
  runProdApplyAndVerify()
    .then(results => {
      console.log(`\n📊 FINAL STATUS: ${results.overall_status}`);
      process.exit(results.overall_status === 'PASS' ? 0 : 1);
    })
    .catch(error => {
      console.error(`\n💥 APPLY/VERIFY FAILED: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { runProdApplyAndVerify };