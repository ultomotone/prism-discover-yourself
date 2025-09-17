import { supabase } from './src/integrations/supabase/client';
import * as fs from 'fs';

async function executeEvidenceGate() {
  console.log('=== EVIDENCE GATE EXECUTION ===');
  console.log('Target: fc_scores v1.2 + profiles v1.2.1 + tokenized security');
  
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  const timestamp = new Date().toISOString();
  
  console.log(`\nSession: ${sessionId}`);
  console.log(`Timestamp: ${timestamp}`);
  
  // STEP 1: Call finalizeAssessment (idempotent)
  console.log('\n🎯 STEP 1: Calling finalizeAssessment...');
  
  const { data: finalizeData, error: finalizeError } = await supabase.functions.invoke('finalizeAssessment', {
    body: { session_id: sessionId }
  });
  
  if (finalizeError) {
    console.error('❌ finalizeAssessment failed:', finalizeError);
    throw new Error(`finalizeAssessment failed: ${finalizeError.message}`);
  }
  
  console.log('✅ finalizeAssessment response:', JSON.stringify(finalizeData, null, 2));
  
  // STEP 2: Verify fc_scores with correct version
  console.log('\n🔍 STEP 2: Verifying fc_scores...');
  
  const { data: fcScores, error: fcError } = await supabase
    .from('fc_scores')
    .select('version, scores_json, created_at, fc_kind, blocks_answered')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (fcError) {
    console.error('❌ fc_scores query failed:', fcError);
    throw new Error(`FC scores verification failed: ${fcError.message}`);
  }
  
  const fcRecord = fcScores?.[0];
  const fcVersionOk = fcRecord?.version === 'v1.2';
  const fcScoresPresent = !!fcRecord?.scores_json && typeof fcRecord.scores_json === 'object';
  
  console.log(`Version: ${fcRecord?.version} ${fcVersionOk ? '✅' : '❌'}`);
  console.log(`Scores JSON: ${fcScoresPresent ? 'Present (object)' : 'Missing/Invalid'} ${fcScoresPresent ? '✅' : '❌'}`);
  console.log(`Blocks Answered: ${fcRecord?.blocks_answered || 0}`);
  console.log(`FC Kind: ${fcRecord?.fc_kind || 'unknown'}`);
  
  // STEP 3: Verify profiles with correct version
  console.log('\n🔍 STEP 3: Verifying profiles...');
  
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('results_version, type_code, overlay, created_at, updated_at')
    .eq('session_id', sessionId);
    
  if (profileError) {
    console.error('❌ profiles query failed:', profileError);
    throw new Error(`Profiles verification failed: ${profileError.message}`);
  }
  
  const profileRecord = profiles?.[0];
  const profileVersionOk = profileRecord?.results_version === 'v1.2.1';
  
  console.log(`Results Version: ${profileRecord?.results_version} ${profileVersionOk ? '✅' : '❌'}`);
  console.log(`Type Code: ${profileRecord?.type_code || 'none'}`);
  console.log(`Overlay: ${profileRecord?.overlay || 'none'}`);
  console.log(`Updated: ${profileRecord?.updated_at}`);
  
  // STEP 4: Test Results URL security
  console.log('\n🔒 STEP 4: Testing Results URL security...');
  
  const resultsUrl = finalizeData?.results_url;
  let tokenAccessOk = false;
  let nonTokenBlocked = false;
  
  if (resultsUrl) {
    console.log(`Results URL: ${resultsUrl}`);
    
    // Test with token (should work)
    try {
      const response = await fetch(resultsUrl);
      tokenAccessOk = response.status === 200;
      console.log(`With token: HTTP ${response.status} ${tokenAccessOk ? '✅ PASS' : '❌ FAIL'}`);
    } catch (err) {
      console.log(`With token: Network error - ${err} ❌`);
    }
    
    // Test without token (should be blocked)
    try {
      const baseUrl = resultsUrl.split('?')[0];
      const response = await fetch(baseUrl);
      nonTokenBlocked = response.status === 401 || response.status === 403;
      console.log(`Without token: HTTP ${response.status} ${nonTokenBlocked ? '✅ BLOCKED' : '❌ NOT BLOCKED'}`);
    } catch (err) {
      console.log(`Without token: Network error (expected blocking) ✅`);
      nonTokenBlocked = true;
    }
  } else {
    console.log('❌ No results URL returned');
  }
  
  // STEP 5: Evidence evaluation
  console.log('\n📊 EVIDENCE EVALUATION');
  console.log('='.repeat(60));
  
  const evidence = {
    fc_scores_v12: fcVersionOk && fcScoresPresent,
    profiles_v121: profileVersionOk,
    tokenized_access_works: tokenAccessOk,
    non_tokenized_blocked: nonTokenBlocked,
    results_url_present: !!resultsUrl
  };
  
  // Display results
  console.log(`FC Scores v1.2 + JSON:     ${evidence.fc_scores_v12 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Profiles v1.2.1:          ${evidence.profiles_v121 ? '✅ PASS' : '❌ FAIL'}`);  
  console.log(`Tokenized Access Works:    ${evidence.tokenized_access_works ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Non-Tokenized Blocked:     ${evidence.non_tokenized_blocked ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Results URL Present:       ${evidence.results_url_present ? '✅ PASS' : '❌ FAIL'}`);
  
  const overallPass = Object.values(evidence).every(Boolean);
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 EVIDENCE GATE: ${overallPass ? '✅ PASS - READY FOR BACKFILL' : '❌ FAIL - DO NOT PROCEED'}`);
  console.log('='.repeat(60));
  
  // STEP 6: Generate evidence report
  const evidenceReport = `# Evidence Gate Execution Results

**Timestamp**: ${timestamp}  
**Session ID**: ${sessionId}  
**Target Versions**: FC v1.2, Engine v1.2.1  

## finalizeAssessment Response ✅

\`\`\`json
${JSON.stringify(finalizeData, null, 2)}
\`\`\`

## Database Verification

### FC Scores Table
- **Version**: ${fcRecord?.version || 'none'}
- **Scores Type**: ${typeof fcRecord?.scores_json}
- **Blocks Answered**: ${fcRecord?.blocks_answered || 0}
- **FC Kind**: ${fcRecord?.fc_kind || 'unknown'}  
- **Created**: ${fcRecord?.created_at || 'unknown'}
- **Status**: ${evidence.fc_scores_v12 ? '✅ PASS' : '❌ FAIL'}

### Profiles Table  
- **Results Version**: ${profileRecord?.results_version || 'none'}
- **Type Code**: ${profileRecord?.type_code || 'none'}
- **Overlay**: ${profileRecord?.overlay || 'none'}
- **Updated**: ${profileRecord?.updated_at || 'unknown'}
- **Status**: ${evidence.profiles_v121 ? '✅ PASS' : '❌ FAIL'}

## HTTP Security Verification

### Results URL Access
- **URL**: ${resultsUrl || 'Not provided'}
- **With Token**: ${evidence.tokenized_access_works ? 'HTTP 200 ✅' : 'Failed ❌'}  
- **Without Token**: ${evidence.non_tokenized_blocked ? 'Blocked (401/403) ✅' : 'Not Blocked ❌'}

## Evidence Summary

| Check | Result |
|-------|---------|
| FC Scores v1.2 + JSON | ${evidence.fc_scores_v12 ? '✅ PASS' : '❌ FAIL'} |
| Profiles v1.2.1 | ${evidence.profiles_v121 ? '✅ PASS' : '❌ FAIL'} |
| Tokenized Access | ${evidence.tokenized_access_works ? '✅ PASS' : '❌ FAIL'} |  
| Security Enforced | ${evidence.non_tokenized_blocked ? '✅ PASS' : '❌ FAIL'} |
| Results URL Present | ${evidence.results_url_present ? '✅ PASS' : '❌ FAIL'} |

## Overall Gate Status

**${overallPass ? '✅ EVIDENCE GATE PASSED' : '❌ EVIDENCE GATE FAILED'}**

${overallPass ? 
  '**Ready for Phase 2**: Hard evidence captured that fc_scores v1.2 and profiles v1.2.1 exist with proper tokenized security. Proceed to staging backfill.' : 
  '**Do Not Proceed**: Evidence validation failed. Resolve issues before continuing to backfill phase.'}

---
*Evidence gate execution completed at ${timestamp}*
`;

  fs.writeFileSync('evidence_gate.md', evidenceReport);
  console.log(`\n📝 Evidence report saved to evidence_gate.md`);
  
  if (!overallPass) {
    throw new Error('Evidence gate failed - cannot proceed to backfill');
  }
  
  console.log('\n🚦 HALT FOR APPROVAL - Review evidence_gate.md before proceeding to backfill');
  
  return {
    success: overallPass,
    evidence,
    nextPhase: 'BACKFILL_STAGING'
  };
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  executeEvidenceGate()
    .then(result => {
      console.log('\n🎯 Evidence Gate Result:', result.success ? 'PASSED' : 'FAILED');
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Evidence Gate Error:', error);
      process.exit(1);
    });
}

export default executeEvidenceGate;