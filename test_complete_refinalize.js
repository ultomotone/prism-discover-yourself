// Complete Production Re-Finalize Test with Evidence Collection
import { admin as supabase } from './supabase/admin.js';

async function completeRefinializeTest() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  const fcVersion = 'v1.2';
  const engineVersion = 'v1.2.1';
  
  console.log('🚀 COMPLETE REFINALIZE TEST');
  console.log('================================');
  console.log(`Session: ${sessionId}`);
  console.log(`FC Version: ${fcVersion}`);
  console.log(`Engine Version: ${engineVersion}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('');

  const testResults = {
    phase1: null,
    phase2: null, 
    phase3: null,
    phase4: null,
    verdict: null
  };

  try {
    // PHASE 1: Invoke finalizeAssessment
    console.log('📞 PHASE 1: Invoking finalizeAssessment...');
    const { data: finalizeData, error: finalizeError } = await supabase.functions.invoke('finalizeAssessment', {
      body: { session_id: sessionId, fc_version: fcVersion }
    });

    testResults.phase1 = {
      success: !finalizeError,
      data: finalizeData,
      error: finalizeError,
      timestamp: new Date().toISOString()
    };

    if (finalizeError) {
      console.error('❌ Phase 1 Failed:', finalizeError);
    } else {
      console.log('✅ Phase 1 Success:', finalizeData?.status);
    }

    // PHASE 2: Check profile creation
    console.log('\n🔍 PHASE 2: Checking Profile Creation...');
    const { data: profiles } = await supabase
      .from('profiles')
      .select('results_version, version, created_at, updated_at')
      .eq('session_id', sessionId);

    testResults.phase2 = {
      profileCount: profiles?.length || 0,
      profiles,
      needsPhase3: !profiles || profiles.length === 0
    };

    if (profiles && profiles.length > 0) {
      console.log('✅ Profile Found:', profiles[0]);
    } else {
      console.log('⚠️ No profile found - proceeding to Phase 3');
    }

    // PHASE 3: Admin Fallback (if needed)
    if (testResults.phase2.needsPhase3) {
      console.log('\n🔧 PHASE 3: Admin Fallback via score_prism...');
      const { data: prismData, error: prismError } = await supabase.functions.invoke('score_prism', {
        body: { session_id: sessionId, engine_version: engineVersion }
      });

      testResults.phase3 = {
        success: !prismError,
        data: prismData,
        error: prismError
      };

      if (prismError) {
        console.error('❌ Phase 3 Failed:', prismError);
      } else {
        console.log('✅ Phase 3 Success:', prismData?.status);
        
        // Re-check profiles after admin recovery
        const { data: recoveredProfiles } = await supabase
          .from('profiles')
          .select('results_version, version, created_at, updated_at')
          .eq('session_id', sessionId);
        
        testResults.phase3.recoveredProfiles = recoveredProfiles;
        console.log('Profile after recovery:', recoveredProfiles);
      }
    }

    // PHASE 4: Evidence Collection
    console.log('\n📊 PHASE 4: Evidence Collection...');
    
    // FC Scores verification
    const { data: fcScores } = await supabase
      .from('fc_scores')
      .select('version, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1);

    // Final profile check  
    const { data: finalProfiles } = await supabase
      .from('profiles')
      .select('results_version, version, created_at, updated_at')
      .eq('session_id', sessionId);

    testResults.phase4 = {
      fcScores: fcScores?.[0],
      profiles: finalProfiles,
      hasProfile: finalProfiles && finalProfiles.length > 0,
      resultsUrl: testResults.phase1?.data?.results_url
    };

    // PHASE 5: Final Verdict
    const hasValidFcScores = fcScores?.[0]?.version === 'v1.2';
    const hasValidProfile = finalProfiles && finalProfiles.length > 0 && 
                           finalProfiles[0]?.results_version === 'v1.2.1';
    
    testResults.verdict = {
      fcScoresPass: hasValidFcScores,
      profilesPass: hasValidProfile,
      overallPass: hasValidFcScores && hasValidProfile,
      timestamp: new Date().toISOString()
    };

    console.log('\n🎯 FINAL VERDICT:');
    console.log('FC Scores (v1.2):', hasValidFcScores ? '✅' : '❌');
    console.log('Profiles (v1.2.1):', hasValidProfile ? '✅' : '❌');
    console.log('Overall Result:', testResults.verdict.overallPass ? '🟢 PASS' : '🔴 FAIL');

    return testResults;

  } catch (err) {
    console.error('❌ Critical Test Error:', err);
    testResults.verdict = { overallPass: false, error: err };
    return testResults;
  }
}

// Execute test
completeRefinializeTest().then(results => {
  console.log('\n📋 COMPLETE TEST RESULTS:');
  console.log(JSON.stringify(results, null, 2));
});

export { completeRefinializeTest };