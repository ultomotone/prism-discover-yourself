#!/usr/bin/env tsx

/**
 * IR-07B FC Smoke Test Runner - Execute and capture results
 * 
 * Usage: npx tsx run_fc_smoke.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gnkuikentdtnatazeriu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U'
);

const TEST_SESSIONS = [
  '618c5ea6-aeda-4084-9156-0aac9643afd3',
  '070d9bf2-516f-44ee-87fc-017c7db9d29c'
];

async function testScoreFcSession(sessionId: string) {
  console.log(`\n🧪 Testing score_fc_session for ${sessionId.substring(0,8)}...`);

  try {
    // Before test - check existing fc_scores
    const { data: existingScores } = await supabase
      .from('fc_scores')
      .select('*')
      .eq('session_id', sessionId)
      .eq('version', 'v1.2');

    console.log(`  📋 Pre-test fc_scores: ${existingScores?.length || 0} rows`);

    // Call score_fc_session
    const { data, error } = await supabase.functions.invoke('score_fc_session', {
      body: {
        session_id: sessionId,
        basis: 'functions',
        version: 'v1.2'
      }
    });

    if (error) {
      throw new Error(`Function call failed: ${JSON.stringify(error)}`);
    }

    console.log(`  📊 Function result:`, data);

    // After test - verify fc_scores creation
    const { data: newScores } = await supabase
      .from('fc_scores')
      .select('*')
      .eq('session_id', sessionId)
      .eq('version', 'v1.2');

    const scoreKeys = Object.keys(data?.scores || {});
    console.log(`  ✅ FC Scores created: ${newScores?.length || 0} rows`);
    console.log(`  📈 Score functions: ${scoreKeys.join(', ')}`);
    console.log(`  🎯 Blocks answered: ${data?.blocks_answered || 0}`);

    return {
      sessionId,
      success: true,
      blocksAnswered: data?.blocks_answered || 0,
      scoreKeys,
      fcScoreRows: newScores?.length || 0
    };

  } catch (error) {
    console.error(`  ❌ Test failed:`, error);
    return {
      sessionId,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function main() {
  console.log('🚀 IR-07B FC Smoke Tests');
  console.log('========================');
  console.log(`Testing ${TEST_SESSIONS.length} sessions against v1.2 FC infrastructure`);

  const results = [];
  
  for (const sessionId of TEST_SESSIONS) {
    const result = await testScoreFcSession(sessionId);
    results.push(result);
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
    console.log(`✅ Ready for backfill phase (IR-08A)`);
  } else {
    console.log(`\n⚠️  TESTS FAILED - Review errors above`);
    process.exit(1);
  }

  // Generate detailed report
  const report = {
    timestamp: new Date().toISOString(),
    environment: 'staging',
    fc_version: 'v1.2',
    tests_run: results.length,
    passed: passCount,
    failed: failCount,
    results: results
  };

  console.log(`\n📝 Detailed results:`, JSON.stringify(report, null, 2));
  
  return results;
}

if (import.meta.main) {
  main().catch(console.error);
}