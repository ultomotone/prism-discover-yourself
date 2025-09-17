#!/usr/bin/env tsx

/**
 * IR-09B2 E2E Finalize Flow Test
 * Tests complete assessment finalization with FC v1.2 + PRISM v1.2.1
 */

import { supabase } from "@/integrations/supabase/client";

const TEST_SESSION = '618c5ea6-aeda-4084-9156-0aac9643afd3';

async function testFinalizeE2E() {
  console.log('🎯 IR-09B2 E2E FINALIZE FLOW TEST');
  console.log('=================================');
  console.log(`Session: ${TEST_SESSION.substring(0,8)}`);

  // Pre-test state
  console.log('\n📊 PRE-TEST STATE');
  
  const { data: preFC } = await supabase
    .from('fc_scores')
    .select('*')
    .eq('session_id', TEST_SESSION);
    
  const { data: preProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('session_id', TEST_SESSION);

  console.log(`FC Scores (pre): ${preFC?.length || 0} rows`);
  console.log(`Profiles (pre): ${preProfile?.length || 0} rows`);
  
  if (preProfile?.[0]) {
    console.log(`Existing profile version: ${preProfile[0].results_version || 'none'}`);
  }

  // Execute finalizeAssessment
  console.log('\n🚀 EXECUTING FINALIZE ASSESSMENT');
  
  try {
    const { data, error } = await supabase.functions.invoke('finalizeAssessment', {
      body: {
        session_id: TEST_SESSION,
        responses: [] // Empty since session already has responses
      }
    });

    if (error) {
      console.log('❌ Finalize failed:', error);
      return { success: false, error };
    }

    console.log('✅ Finalize succeeded:', data);

    // Post-test verification
    console.log('\n🔍 POST-TEST VERIFICATION');
    
    const { data: postFC } = await supabase
      .from('fc_scores')
      .select('*')
      .eq('session_id', TEST_SESSION)
      .eq('version', 'v1.2');
      
    const { data: postProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('session_id', TEST_SESSION);

    console.log(`FC Scores (v1.2): ${postFC?.length || 0} rows`);
    console.log(`Profiles: ${postProfile?.length || 0} rows`);
    
    if (postProfile?.[0]) {
      console.log(`Profile version: ${postProfile[0].results_version || 'none'}`);
      console.log(`Type code: ${postProfile[0].type_code || 'none'}`);
    }

    // Verify results URL
    const resultsUrl = data?.results_url;
    if (resultsUrl) {
      const hasToken = resultsUrl.includes('?t=');
      console.log(`Results URL token: ${hasToken ? '✅' : '❌'}`);
    }

    // Summary
    const checks = {
      finalizeSuccess: !!data && !error,
      fcScoresCreated: postFC?.length > 0,
      fcScoresV12: postFC?.some(s => s.version === 'v1.2'),
      profileExists: postProfile?.length > 0,
      profileV121: postProfile?.some(p => p.results_version === 'v1.2.1'),
      resultsUrlToken: resultsUrl?.includes('?t=')
    };

    console.log('\n📋 VERIFICATION CHECKLIST');
    console.log('=========================');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
    });

    const allPassed = Object.values(checks).every(Boolean);
    console.log(`\n🏁 E2E TEST: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);

    return {
      success: allPassed,
      checks,
      finalizeResult: data,
      fcScores: postFC,
      profile: postProfile?.[0]
    };

  } catch (err) {
    console.log('❌ Exception:', err.message);
    return { success: false, error: err.message };
  }
}

async function main() {
  const result = await testFinalizeE2E();
  
  if (result.success) {
    console.log('\n🎉 E2E TEST PASSED - FC PIPELINE FULLY OPERATIONAL');
    console.log('✅ Ready for backfill orchestrator (IR-08A-SUPER)');
  } else {
    console.log('\n⚠️ E2E TEST FAILED - Investigation needed');
    console.log('Error:', result.error || 'See checklist above');
  }
  
  return result;
}

if (import.meta.main) {
  main();
}

export { testFinalizeE2E };