#!/usr/bin/env tsx

/**
 * EXEC-02: Finalize Flow E2E Verify
 * Test complete scoring pipeline via finalizeAssessment
 */

import { supabase } from "@/integrations/supabase/client";

const SESSION_TEST = '618c5ea6-aeda-4084-9156-0aac9643afd3';
const ENGINE_VERSION = 'v1.2.1';
const FC_VERSION = 'v1.2';

async function executeE2ETest() {
  console.log('🎯 EXEC-02: Finalize Flow E2E Verify');
  console.log('====================================');
  console.log(`Session: ${SESSION_TEST.substring(0,8)}`);
  console.log(`Engine Version: ${ENGINE_VERSION}`);
  console.log(`FC Version: ${FC_VERSION}`);

  try {
    // Pre-test state
    console.log('\n📋 Pre-test database state...');
    
    const { data: preProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('session_id', SESSION_TEST);
      
    const { data: preFcScores } = await supabase
      .from('fc_scores')
      .select('*')
      .eq('session_id', SESSION_TEST);

    console.log(`Pre-test profiles: ${preProfile?.length || 0} rows`);
    console.log(`Pre-test fc_scores: ${preFcScores?.length || 0} rows`);

    // Execute finalizeAssessment
    console.log('\n🚀 Calling finalizeAssessment...');
    
    const { data, error } = await supabase.functions.invoke('finalizeAssessment', {
      body: {
        session_id: SESSION_TEST,
        responses: [] // Empty since session already has responses
      }
    });

    if (error) {
      console.log('❌ finalizeAssessment error:', error);
      return { success: false, error };
    }

    console.log('✅ finalizeAssessment response:', data);

    // Post-test verification
    console.log('\n🔍 Post-test verification...');
    
    const { data: postProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('session_id', SESSION_TEST);
      
    const { data: postFcScores } = await supabase
      .from('fc_scores')
      .select('*')
      .eq('session_id', SESSION_TEST)
      .eq('version', FC_VERSION);

    const profile = postProfile?.[0];
    const fcScore = postFcScores?.[0];

    console.log(`Post-test profiles: ${postProfile?.length || 0} rows`);
    console.log(`Post-test fc_scores (v1.2): ${postFcScores?.length || 0} rows`);

    if (profile) {
      console.log(`📊 Profile version: ${profile.results_version}`);
      console.log(`🎯 Type code: ${profile.type_code}`);
    }

    if (fcScore) {
      console.log(`📈 FC version: ${fcScore.version}`);
      console.log(`🔧 FC kind: ${fcScore.fc_kind}`);
      console.log(`📋 Blocks answered: ${fcScore.blocks_answered}`);
    }

    // Verification checklist
    const checks = {
      finalizeSuccess: !!data && !error,
      fcScoresCreated: postFcScores?.length > 0,
      fcScoresV12: fcScore?.version === FC_VERSION,
      profileCreated: postProfile?.length > 0,
      profileV121: profile?.results_version === ENGINE_VERSION,
      resultsUrlToken: data?.results_url?.includes('?t='),
      shareToken: !!data?.share_token
    };

    console.log('\n📋 VERIFICATION CHECKLIST');
    console.log('=========================');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
    });

    const allPassed = Object.values(checks).every(Boolean);
    console.log(`\n🏁 E2E TEST RESULT: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);

    return {
      success: allPassed,
      checks,
      finalizeResult: data,
      profile,
      fcScore,
      resultsUrl: data?.results_url
    };

  } catch (err) {
    console.log('❌ Exception:', err);
    return { success: false, error: err.message };
  }
}

// Execute E2E test
executeE2ETest().then(result => {
  if (result.success) {
    console.log('\n🎉 E2E TEST PASSED - COMPLETE PIPELINE OPERATIONAL');
    console.log('✅ profiles.results_version stamped v1.2.1');
    console.log('✅ fc_scores.version stamped v1.2');
    console.log('✅ Tokenized results URL generated');
    console.log('✅ Ready for backfill orchestrator (BF-01)');
  } else {
    console.log('\n⚠️ E2E TEST FAILED - BLOCKING');
    console.log('Error:', result.error);
  }
}).catch(console.error);