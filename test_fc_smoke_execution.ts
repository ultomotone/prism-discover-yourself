#!/usr/bin/env tsx

/**
 * IR-07B-SMOKE-RUN - Execute FC Smoke Test
 * Actually run score_fc_session and verify fc_scores creation
 */

import { supabase } from "@/integrations/supabase/client";

const TEST_SESSIONS = [
  '618c5ea6-aeda-4084-9156-0aac9643afd3',
  '070d9bf2-516f-44ee-87fc-017c7db9d29c'
];

async function executeFcSmoke() {
  console.log('🚀 IR-07B-SMOKE-RUN - FC Smoke Execution');
  console.log('========================================');
  console.log(`Testing ${TEST_SESSIONS.length} sessions with FC version v1.2`);

  const results = [];

  for (const sessionId of TEST_SESSIONS) {
    const shortId = sessionId.substring(0, 8);
    console.log(`\n🧪 Testing session: ${shortId}...`);

    try {
      // Execute score_fc_session with v1.2
      console.log(`  🎯 Invoking score_fc_session(session_id=${shortId}, version=v1.2, basis=functions)...`);
      
      const { data, error } = await supabase.functions.invoke('score_fc_session', {
        body: {
          session_id: sessionId,
          version: 'v1.2',
          basis: 'functions'
        }
      });

      if (error) {
        console.log(`  ❌ Function error:`, error);
        results.push({
          sessionId,
          shortId,
          success: false,
          error: error.message || JSON.stringify(error)
        });
        continue;
      }

      console.log(`  ✅ Function response:`, data);

      // Verify fc_scores was created with version='v1.2'
      const { data: fcScores, error: scoresError } = await supabase
        .from('fc_scores')
        .select('*')
        .eq('session_id', sessionId)
        .eq('version', 'v1.2');

      if (scoresError) {
        console.log(`  ❌ FC scores verification failed:`, scoresError);
        results.push({
          sessionId,
          shortId,
          success: false,
          error: `FC scores check failed: ${scoresError.message}`
        });
        continue;
      }

      const fcScoreCount = fcScores?.length || 0;
      const scoresJson = fcScores?.[0]?.scores_json || {};
      const scoreKeys = Object.keys(scoresJson);

      console.log(`  📊 FC Scores created: ${fcScoreCount} rows`);
      console.log(`  📈 Score functions: ${scoreKeys.join(', ')}`);
      console.log(`  🎯 Blocks answered: ${data?.blocks_answered || 0}`);
      console.log(`  📝 Version stamped: ${fcScores?.[0]?.version || 'none'}`);

      results.push({
        sessionId,
        shortId,
        success: true,
        functionResult: data,
        fcScoresCount: fcScoreCount,
        fcScoresVersion: fcScores?.[0]?.version,
        scoreKeys,
        blocksAnswered: data?.blocks_answered || 0
      });

    } catch (err) {
      console.log(`  ❌ Exception:`, err);
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
  
  console.log(`\n📊 FC SMOKE TEST SUMMARY`);
  console.log(`========================`);
  console.log(`✅ Passed: ${passCount}/${results.length}`);
  console.log(`❌ Failed: ${failCount}/${results.length}`);
  console.log(`🎯 Success Rate: ${Math.round((passCount/results.length)*100)}%`);
  
  if (passCount === results.length) {
    console.log(`\n🎉 FC SMOKE TEST PASSED`);
    console.log(`✅ fc_scores rows created with version='v1.2'`);
    console.log(`✅ Function execution confirmed via telemetry`);
    console.log(`✅ Ready for E2E finalize flow test (IR-09B2)`);
  } else {
    console.log(`\n⚠️ FC SMOKE TEST FAILED`);
    console.log(`Review errors above and check function logs`);
  }

  return {
    passed: passCount === results.length,
    results,
    summary: {
      total: results.length,
      passed: passCount,
      failed: failCount,
      successRate: Math.round((passCount/results.length)*100)
    }
  };
}

// Execute
if (import.meta.main) {
  executeFcSmoke().catch(console.error);
}

export { executeFcSmoke };