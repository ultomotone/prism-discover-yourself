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
  
  console.log('=== GATE-EVIDENCE EXECUTION ===');
  console.log(`Session ID: ${sessionId}`);
  console.log(`Target FC Version: v1.2`);
  console.log(`Target Engine Version: v1.2.1`);
  
  // Step 1: Invoke finalizeAssessment
  console.log('\n1. Invoking finalizeAssessment...');
  const { data: finalizeData, error: finalizeError } = await supabase.functions.invoke('finalizeAssessment', {
    body: { session_id: sessionId }
  });

  if (finalizeError) {
    console.error('❌ finalizeAssessment failed:', finalizeError);
    return { success: false, step: 'finalize', error: finalizeError };
  }
  
  console.log('✅ finalizeAssessment response:', JSON.stringify(finalizeData, null, 2));
  
  // Step 2: Verify fc_scores
  console.log('\n2. Checking fc_scores table...');
  const { data: fcScores, error: fcError } = await supabase
    .from('fc_scores')
    .select('version, scores_json, created_at, fc_kind, blocks_answered')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (fcError) {
    console.error('❌ fc_scores query failed:', fcError);
    return { success: false, step: 'fc_scores', error: fcError };
  }
  
  console.log('FC Scores result:', fcScores);
  
  // Step 3: Verify profiles  
  console.log('\n3. Checking profiles table...');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('results_version, created_at, updated_at, type_code, overlay')
    .eq('session_id', sessionId);

  if (profileError) {
    console.error('❌ profiles query failed:', profileError);
    return { success: false, step: 'profiles', error: profileError };
  }
  
  console.log('Profiles result:', profiles);
  
  // Step 4: Test Results URL access
  console.log('\n4. Testing Results URL access...');
  const resultsUrl = finalizeData?.results_url;
  console.log('Results URL:', resultsUrl);
  
  if (resultsUrl) {
    try {
      const response = await fetch(resultsUrl);
      console.log(`✅ With token: HTTP ${response.status}`);
    } catch (err) {
      console.log('❌ With token: Failed to fetch:', err);
    }
    
    // Test without token
    const baseUrl = resultsUrl.split('?')[0];
    try {
      const response = await fetch(baseUrl);
      console.log(`✅ Without token: HTTP ${response.status}`);
    } catch (err) {
      console.log('❌ Without token: Failed to fetch:', err);
    }
  }
  
  // Evidence summary
  console.log('\n=== EVIDENCE SUMMARY ===');
  const fcScoreValid = fcScores?.[0]?.version === 'v1.2' && fcScores?.[0]?.scores_json;
  const profileValid = profiles?.[0]?.results_version === 'v1.2.1';
  
  console.log(`FC Scores (v1.2): ${fcScoreValid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Profiles (v1.2.1): ${profileValid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Results URL: ${resultsUrl ? '✅ PASS' : '❌ FAIL'}`);
  
  const overallPass = fcScoreValid && profileValid && resultsUrl;
  console.log(`\nOVERALL GATE: ${overallPass ? '✅ PASS' : '❌ FAIL'}`);
  
  return {
    success: overallPass,
    evidence: {
      finalizeResponse: finalizeData,
      fcScores: fcScores?.[0],
      profiles: profiles?.[0],
      resultsUrl
    }
  };
}

// Run the evidence gate
runEvidenceGate().then(result => {
  console.log('\nFinal result:', result.success ? 'EVIDENCE GATE PASSED' : 'EVIDENCE GATE FAILED');
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});