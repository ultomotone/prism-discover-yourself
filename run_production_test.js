// Production test execution for finalizeAssessment
import { admin as supabase } from './supabase/admin.js';

async function runProductionTest() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  const fcVersion = 'v1.2';
  
  console.log('🔄 PRODUCTION FINALIZE TEST - STARTING');
  console.log('Session ID:', sessionId);
  console.log('FC Version:', fcVersion);
  console.log('Timestamp:', new Date().toISOString());

  try {
    // Pre-check: FC Scores
    console.log('\n📊 PRE-CHECK: FC Scores');
    const { data: preFC } = await supabase
      .from('fc_scores')
      .select('version, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1);
    console.log('Existing FC Scores:', preFC);

    // Pre-check: Profiles
    console.log('\n👤 PRE-CHECK: Profiles');
    const { data: preProfiles } = await supabase
      .from('profiles')
      .select('results_version, created_at')
      .eq('session_id', sessionId);
    console.log('Existing Profiles:', preProfiles);

    // STEP 1: Invoke finalizeAssessment
    console.log('\n📞 STEP 1: Invoking finalizeAssessment...');
    const { data: response, error } = await supabase.functions.invoke('finalizeAssessment', {
      body: { session_id: sessionId, fc_version: fcVersion }
    });

    if (error) {
      console.error('❌ Function Error:', error);
      return { success: false, error };
    }

    console.log('✅ Function Response:', JSON.stringify(response, null, 2));

    // STEP 2: Post-check FC Scores
    console.log('\n📊 POST-CHECK: FC Scores');
    const { data: postFC } = await supabase
      .from('fc_scores')
      .select('version, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1);
    console.log('FC Scores after invoke:', postFC);

    // STEP 3: Post-check Profiles  
    console.log('\n👤 POST-CHECK: Profiles');
    const { data: postProfiles } = await supabase
      .from('profiles')
      .select('results_version, version, created_at, updated_at')
      .eq('session_id', sessionId);
    console.log('Profiles after invoke:', postProfiles);

    // STEP 4: Test HTTP Access
    if (response?.results_url) {
      console.log('\n🌐 STEP 4: HTTP Access Tests');
      
      try {
        const withTokenResp = await fetch(response.results_url);
        console.log('✅ With Token Status:', withTokenResp.status);
        
        const baseUrl = response.results_url.split('?')[0];
        const withoutTokenResp = await fetch(baseUrl);
        console.log('✅ Without Token Status:', withoutTokenResp.status);
      } catch (httpError) {
        console.error('❌ HTTP Test Error:', httpError.message);
      }
    }

    return {
      success: true,
      response,
      fcScores: postFC,
      profiles: postProfiles,
      timestamp: new Date().toISOString()
    };

  } catch (err) {
    console.error('❌ Production test failed:', err);
    return { success: false, error: err };
  }
}

// Execute the test
runProductionTest().then(result => {
  console.log('\n📋 TEST COMPLETE:', result.success ? 'SUCCESS' : 'FAILED');
});

export { runProductionTest };