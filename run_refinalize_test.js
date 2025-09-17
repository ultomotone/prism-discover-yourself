// PHASE 1-2: Invoke finalizeAssessment and check results
import { admin as supabase } from './supabase/admin.js';

async function runRefinializeTest() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  const fcVersion = 'v1.2';
  
  console.log('🚀 PHASE 1: Invoking finalizeAssessment');
  console.log(`Session: ${sessionId}`);
  console.log(`FC Version: ${fcVersion}`);
  console.log(`Time: ${new Date().toISOString()}`);

  try {
    // PHASE 1: Invoke finalizeAssessment
    const { data, error } = await supabase.functions.invoke('finalizeAssessment', {
      body: { 
        session_id: sessionId, 
        fc_version: fcVersion 
      }
    });

    const response = {
      success: !error,
      data,
      error,
      timestamp: new Date().toISOString()
    };

    console.log('\n📋 Function Response:');
    console.log(JSON.stringify(response, null, 2));

    // PHASE 2: Check profile creation
    console.log('\n🔍 PHASE 2: Profile Verification');
    const { data: profiles } = await supabase
      .from('profiles')
      .select('results_version, version, created_at, updated_at')
      .eq('session_id', sessionId);

    console.log(`Profiles found: ${profiles?.length || 0}`);
    if (profiles && profiles.length > 0) {
      console.log('Profile:', JSON.stringify(profiles[0], null, 2));
    }

    // Save response for artifacts
    console.log('\n💾 Saving response to artifacts...');
    
    return {
      phase1: response,
      phase2: { profiles, profileCount: profiles?.length || 0 },
      needsPhase3: !profiles || profiles.length === 0
    };

  } catch (err) {
    console.error('❌ Test Error:', err);
    return { 
      phase1: { success: false, error: err },
      phase2: { profiles: null, profileCount: 0 },
      needsPhase3: true
    };
  }
}

runRefinializeTest().then(result => {
  console.log('\n🎯 TEST SUMMARY:');
  console.log('Phase 1 Success:', result.phase1.success);
  console.log('Profile Created:', result.phase2.profileCount > 0);
  console.log('Needs Phase 3 (Admin Fallback):', result.needsPhase3);
});

export { runRefinializeTest };