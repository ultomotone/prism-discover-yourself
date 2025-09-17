import { createClient } from '@supabase/supabase-js';

const url = "https://gnkuikentdtnatazeriu.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function runEvidenceGate() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  const fcVersion = 'v1.2';
  const engineVersion = 'v1.2.1';
  
  console.log('=== EVIDENCE GATE EXECUTION ===');
  console.log(`Session ID: ${sessionId}`);
  console.log(`Target FC Version: ${fcVersion}`);
  console.log(`Target Engine Version: ${engineVersion}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  try {
    // PRECHECK - Session state
    console.log('\n🔍 PRECHECK - Session State...');
    const { data: sessionCheck, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('status, completed_questions, share_token')
      .eq('id', sessionId)
      .single();
      
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError);
      return { success: false, step: 'precheck', error: sessionError };
    }
    
    console.log(`✅ Session status: ${sessionCheck.status}`);
    console.log(`✅ Completed questions: ${sessionCheck.completed_questions}`);
    console.log(`✅ Share token exists: ${!!sessionCheck.share_token}`);
    
    // EXECUTE - Call finalizeAssessment
    console.log('\n🚀 EXECUTE - Calling finalizeAssessment...');
    const { data: finalizeData, error: finalizeError } = await supabase.functions.invoke('finalizeAssessment', {
      body: { session_id: sessionId }
    });

    if (finalizeError) {
      console.error('❌ finalizeAssessment failed:', finalizeError);
      return { success: false, step: 'execute', error: finalizeError };
    }
    
    console.log('✅ finalizeAssessment SUCCESS');
    console.log('📄 Response:', JSON.stringify(finalizeData, null, 2));
    
    // Extract key data
    const resultsUrl = finalizeData?.results_url;
    const shareToken = finalizeData?.share_token;
    const profileData = finalizeData?.profile;
    
    console.log(`📋 Results URL: ${resultsUrl}`);
    console.log(`🔑 Share Token: ${shareToken ? 'Generated' : 'Missing'}`);
    
    // DB PROOF - Check fc_scores
    console.log('\n📊 DB PROOF - Checking fc_scores...');
    const { data: fcScores, error: fcError } = await supabase
      .from('fc_scores')
      .select('version, scores_json, created_at, fc_kind, blocks_answered')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fcError) {
      console.error('❌ fc_scores query failed:', fcError);
      return { success: false, step: 'db_proof_fc', error: fcError };
    }
    
    const fcScore = fcScores?.[0];
    console.log('FC Scores result:', fcScore ? {
      version: fcScore.version,
      fc_kind: fcScore.fc_kind,
      blocks_answered: fcScore.blocks_answered,
      has_scores_json: !!fcScore.scores_json,
      created_at: fcScore.created_at
    } : 'NO RECORDS');
    
    // DB PROOF - Check profiles  
    console.log('\n👤 DB PROOF - Checking profiles...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('results_version, created_at, updated_at, type_code, overlay, share_token')
      .eq('session_id', sessionId);

    if (profileError) {
      console.error('❌ profiles query failed:', profileError);
      return { success: false, step: 'db_proof_profiles', error: profileError };
    }
    
    const profile = profiles?.[0];
    console.log('Profiles result:', profile ? {
      results_version: profile.results_version,
      type_code: profile.type_code,
      overlay: profile.overlay,
      has_share_token: !!profile.share_token,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    } : 'NO RECORDS');
    
    // HTTP PROOF - Test Results URL access
    console.log('\n🌐 HTTP PROOF - Testing Results URL access...');
    let httpProofWithToken = 'FAILED';
    let httpProofWithoutToken = 'FAILED';
    
    if (resultsUrl) {
      // Test WITH token
      try {
        const response = await fetch(resultsUrl);
        httpProofWithToken = `HTTP ${response.status}`;
        console.log(`✅ With token: ${httpProofWithToken}`);
      } catch (err) {
        httpProofWithToken = `ERROR: ${err.message}`;
        console.log(`❌ With token: ${httpProofWithToken}`);
      }
      
      // Test WITHOUT token
      const baseUrl = resultsUrl.split('?')[0];
      try {
        const response = await fetch(baseUrl);
        httpProofWithoutToken = `HTTP ${response.status}`;
        console.log(`📋 Without token: ${httpProofWithoutToken}`);
      } catch (err) {
        httpProofWithoutToken = `ERROR: ${err.message}`;
        console.log(`❌ Without token: ${httpProofWithoutToken}`);
      }
    } else {
      console.log('❌ No results URL provided by finalizeAssessment');
    }
    
    // TELEMETRY PROOF
    console.log('\n📈 TELEMETRY PROOF - Function Execution Path...');
    console.log('📝 Expected: evt:fc_source=fc_scores');
    console.log('📝 Expected: No evt:engine_version_override');
    console.log('ℹ️  Note: Check Supabase Edge Function logs for detailed telemetry');
    
    // VALIDATION LOGIC
    console.log('\n✅ EVIDENCE VALIDATION ===');
    const fcScoreValid = fcScore?.version === fcVersion && !!fcScore?.scores_json;
    const profileValid = profile?.results_version === engineVersion;
    const httpValid = httpProofWithToken.includes('200') && 
                      (httpProofWithoutToken.includes('401') || httpProofWithoutToken.includes('403'));
    const urlValid = !!resultsUrl;
    
    console.log(`FC Scores (${fcVersion}): ${fcScoreValid ? '✅ PASS' : '❌ FAIL'} - Version: ${fcScore?.version}, Has JSON: ${!!fcScore?.scores_json}`);
    console.log(`Profiles (${engineVersion}): ${profileValid ? '✅ PASS' : '❌ FAIL'} - Version: ${profile?.results_version}`);
    console.log(`HTTP Tokenized Access: ${httpValid ? '✅ PASS' : '❌ FAIL'} - With: ${httpProofWithToken}, Without: ${httpProofWithoutToken}`);
    console.log(`Results URL Generated: ${urlValid ? '✅ PASS' : '❌ FAIL'}`);
    
    const overallPass = fcScoreValid && profileValid && httpValid && urlValid;
    console.log(`\n🎯 OVERALL EVIDENCE GATE: ${overallPass ? '✅ PASS' : '❌ FAIL'}`);
    
    // Return evidence package
    return {
      success: overallPass,
      timestamp: new Date().toISOString(),
      evidence: {
        finalizeResponse: finalizeData,
        fcScore: fcScore,
        profile: profile, 
        httpProof: {
          withToken: httpProofWithToken,
          withoutToken: httpProofWithoutToken
        },
        resultsUrl,
        validation: {
          fcScoreValid,
          profileValid, 
          httpValid,
          urlValid
        }
      }
    };
    
  } catch (error) {
    console.error('💥 UNHANDLED ERROR:', error);
    return { success: false, step: 'execution', error: error.message };
  }
}

// Execute and handle result
runEvidenceGate().then(result => {
  console.log('\n' + '='.repeat(50));
  console.log('📋 FINAL EVIDENCE GATE RESULT');
  console.log('='.repeat(50));
  
  if (result.success) {
    console.log('🎉 EVIDENCE GATE: ✅ PASSED');
    console.log('');
    console.log('📋 READY FOR NEXT PHASE:');
    console.log('   BF-01-APPLY — Backfill (Staging) — Guarded Apply');
    console.log('   Target: ~39 sessions at 20/min throttle');
    console.log('   Output: backfill_logs/* + backfill_summary.md');
  } else {
    console.log('❌ EVIDENCE GATE: FAILED');
    console.log(`📋 Failed at step: ${result.step || 'unknown'}`);
    console.log('🔧 Run triage prompts:');
    console.log('   - IR-07B-INPUTS-VERIFY (data inputs)');
    console.log('   - IR-07B-RLS-FC (RLS/grants on fc_scores)');
    console.log('   - IR-07B-UNBLOCK-TRACE (args/early-return trace)');
  }
  
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error('💥 FATAL ERROR:', err);
  process.exit(1);
});