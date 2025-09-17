#!/usr/bin/env tsx

import { supabase } from "@/integrations/supabase/client";

const TEST_SESSIONS = [
  '618c5ea6-aeda-4084-9156-0aac9643afd3',
  '070d9bf2-516f-44ee-87fc-017c7db9d29c'
];

async function executeSmokeTest() {
  console.log('🚀 IR-07B FC SMOKE TEST EXECUTION');
  console.log('==================================');
  console.log(`Testing ${TEST_SESSIONS.length} sessions with v1.2 FC infrastructure`);

  const results = [];

  for (const sessionId of TEST_SESSIONS) {
    console.log(`\n🧪 Testing session: ${sessionId.substring(0,8)}...`);
    
    try {
      // Call score_fc_session function with v1.2
      console.log(`  🎯 Invoking score_fc_session...`);
      const { data, error } = await supabase.functions.invoke('score_fc_session', {
        body: {
          session_id: sessionId,
          basis: 'functions',
          version: 'v1.2'
        }
      });

      if (error) {
        console.log(`  ❌ Function error:`, error);
        results.push({
          sessionId,
          success: false,
          error: error.message || JSON.stringify(error)
        });
        continue;
      }

      console.log(`  ✅ Function response:`, data);

      // Verify fc_scores was created
      const { data: fcScores, error: scoresError } = await supabase
        .from('fc_scores')
        .select('*')
        .eq('session_id', sessionId)
        .eq('version', 'v1.2');

      if (scoresError) {
        console.log(`  ❌ FC scores check failed:`, scoresError);
        results.push({
          sessionId,
          success: false,
          error: `FC scores verification failed: ${scoresError.message}`
        });
        continue;
      }

      const fcScoreCount = fcScores?.length || 0;
      console.log(`  📊 FC Scores created: ${fcScoreCount} rows`);
      console.log(`  📈 Score functions: ${Object.keys(data?.scores || {}).join(', ')}`);
      console.log(`  🎯 Blocks answered: ${data?.blocks_answered || 0}`);

      results.push({
        sessionId,
        success: true,
        functionResult: data,
        fcScoresCount: fcScoreCount,
        fcScores: fcScores?.[0],
        blocksAnswered: data?.blocks_answered || 0,
        scoreKeys: Object.keys(data?.scores || {})
      });

    } catch (error) {
      console.log(`  ❌ Exception:`, error);
      results.push({
        sessionId,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // Summary
  const passCount = results.filter(r => r.success).length;
  const failCount = results.length - passCount;
  
  console.log(`\n📊 SMOKE TEST SUMMARY`);
  console.log(`=====================`);
  console.log(`✅ Passed: ${passCount}/${results.length}`);
  console.log(`❌ Failed: ${failCount}/${results.length}`);
  console.log(`🎯 Success Rate: ${Math.round((passCount/results.length)*100)}%`);
  
  if (passCount === results.length) {
    console.log(`\n🎉 ALL TESTS PASSED`);
    console.log(`✅ FC Pipeline fully operational for v1.2`);
    console.log(`✅ Ready for finalize flow E2E test`);
  } else {
    console.log(`\n⚠️  TESTS FAILED - Review errors above`);
  }

  return results;
}

// Execute if run directly
if (import.meta.main) {
  executeSmokeTest().catch(console.error);
}

export { executeSmokeTest };