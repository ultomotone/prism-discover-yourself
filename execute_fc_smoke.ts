#!/usr/bin/env tsx

/**
 * EXEC-01: FC Smoke Execute & Verify
 * Run score_fc_session for test sessions and verify fc_scores creation
 */

import { supabase } from "@/integrations/supabase/client";

const TEST_SESSIONS = [
  '618c5ea6-aeda-4084-9156-0aac9643afd3',
  '070d9bf2-516f-44ee-87fc-017c7db9d29c'
];

async function executeFcSmoke() {
  console.log('🚀 EXEC-01: FC Smoke Execute & Verify');
  console.log('====================================');
  console.log(`Sessions: ${TEST_SESSIONS.map(s => s.substring(0,8)).join(', ')}`);
  console.log(`FC Version: v1.2`);

  const results = [];

  for (const sessionId of TEST_SESSIONS) {
    const shortId = sessionId.substring(0, 8);
    console.log(`\n🧪 Executing score_fc_session for ${shortId}...`);

    try {
      // Execute score_fc_session with v1.2
      const { data, error } = await supabase.functions.invoke('score_fc_session', {
        body: {
          session_id: sessionId,
          version: 'v1.2',
          basis: 'functions'
        }
      });

      if (error) {
        console.log(`❌ Function error for ${shortId}:`, error);
        results.push({
          sessionId,
          shortId,
          success: false,
          error: error.message || JSON.stringify(error)
        });
        continue;
      }

      console.log(`✅ Function success for ${shortId}:`, data);

      // Verify fc_scores creation
      const { data: fcScores, error: scoresError } = await supabase
        .from('fc_scores')
        .select('*')
        .eq('session_id', sessionId)
        .eq('version', 'v1.2');

      if (scoresError) {
        console.log(`❌ FC scores verification failed for ${shortId}:`, scoresError);
        results.push({
          sessionId,
          shortId,
          success: false,
          error: `FC scores verification: ${scoresError.message}`
        });
        continue;
      }

      const fcScore = fcScores?.[0];
      const scoresJson = fcScore?.scores_json || {};
      const scoreKeys = Object.keys(scoresJson);

      console.log(`📊 FC Scores created: ${fcScores?.length || 0} rows`);
      console.log(`📝 Version: ${fcScore?.version}`);
      console.log(`🎯 Blocks answered: ${fcScore?.blocks_answered}`);
      console.log(`📈 Score functions: ${scoreKeys.join(', ')}`);

      results.push({
        sessionId,
        shortId,
        success: true,
        functionResult: data,
        fcScore: fcScore,
        scoreKeys,
        blocksAnswered: fcScore?.blocks_answered || 0
      });

    } catch (err) {
      console.log(`❌ Exception for ${shortId}:`, err);
      results.push({
        sessionId,
        shortId,
        success: false,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  // Summary
  const passCount = results.filter(r => r.success).length;
  const failCount = results.length - passCount;
  
  console.log(`\n📊 FC SMOKE EXECUTION SUMMARY`);
  console.log(`=============================`);
  console.log(`✅ Passed: ${passCount}/${results.length}`);
  console.log(`❌ Failed: ${failCount}/${results.length}`);
  
  if (passCount === results.length) {
    console.log(`\n🎉 FC SMOKE TEST PASSED`);
    console.log(`✅ fc_scores rows created with version='v1.2'`);
    console.log(`✅ Ready for E2E finalize flow test`);
  } else {
    console.log(`\n⚠️ FC SMOKE TEST FAILED`);
  }

  return {
    passed: passCount === results.length,
    results,
    summary: { total: results.length, passed: passCount, failed: failCount }
  };
}

// Execute smoke test
executeFcSmoke().then(result => {
  console.log('\n🏁 SMOKE TEST COMPLETE');
  console.log(`Status: ${result.passed ? 'PASS' : 'FAIL'}`);
  
  if (result.passed) {
    console.log('✅ PROCEEDING TO EXEC-02: Finalize Flow E2E');
  } else {
    console.log('❌ BLOCKING - FC Smoke test failed');
  }
}).catch(console.error);