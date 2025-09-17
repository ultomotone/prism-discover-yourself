#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gnkuikentdtnatazeriu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TEST_SESSIONS = [
  '618c5ea6-aeda-4084-9156-0aac9643afd3',
  '070d9bf2-516f-44ee-87fc-017c7db9d29c'
];

async function testScoreFcSession(sessionId: string) {
  console.log(`\n🧪 Testing session: ${sessionId}`);
  
  try {
    // Check pre-state
    const { data: preScores } = await supabase
      .from('fc_scores')
      .select('*')
      .eq('session_id', sessionId)
      .eq('version', 'v1.2');
    
    console.log(`  📊 Pre-test fc_scores: ${preScores?.length || 0} rows`);
    
    // Invoke score_fc_session
    console.log(`  🎯 Invoking score_fc_session...`);
    const { data: result, error: invokeError } = await supabase.functions.invoke('score_fc_session', {
      body: {
        session_id: sessionId,
        basis: 'functions',
        version: 'v1.2'
      }
    });
    
    if (invokeError) {
      console.log(`  ❌ Function error:`, invokeError);
      return { sessionId, success: false, error: invokeError.message };
    }
    
    console.log(`  ✅ Function response:`, JSON.stringify(result, null, 2));
    
    // Verify post-state
    const { data: postScores } = await supabase
      .from('fc_scores')
      .select('*')
      .eq('session_id', sessionId)
      .eq('version', 'v1.2');
    
    console.log(`  📊 Post-test fc_scores: ${postScores?.length || 0} rows`);
    
    if (postScores && postScores.length > 0) {
      const score = postScores[0];
      console.log(`  🎯 FC Score details:`, {
        version: score.version,
        fc_kind: score.fc_kind,
        blocks_answered: score.blocks_answered,
        score_keys: Object.keys(score.scores_json || {})
      });
    }
    
    return { 
      sessionId, 
      success: true, 
      result,
      preScoreCount: preScores?.length || 0,
      postScoreCount: postScores?.length || 0,
      scoreDetails: postScores?.[0] || null
    };
    
  } catch (error) {
    console.log(`  ❌ Test error:`, error);
    return { sessionId, success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 FC Smoke Test - IR-07B');
  console.log('========================');
  
  const results = [];
  
  for (const sessionId of TEST_SESSIONS) {
    const result = await testScoreFcSession(sessionId);
    results.push(result);
  }
  
  // Summary
  console.log('\n📋 SMOKE TEST SUMMARY');
  console.log('=====================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(r => {
    const status = r.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} Session ${r.sessionId}`);
    if (r.success && r.scoreDetails) {
      console.log(`    - FC scores created: version=${r.scoreDetails.version}, blocks=${r.scoreDetails.blocks_answered}`);
      console.log(`    - Score functions: ${Object.keys(r.scoreDetails.scores_json || {}).join(', ')}`);
    }
    if (r.error) {
      console.log(`    - Error: ${r.error}`);
    }
  });
  
  console.log(`\n🎯 RESULT: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED - FC PIPELINE OPERATIONAL');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED - INVESTIGATION REQUIRED');
    process.exit(1);
  }
}

if (import.meta.main) {
  main().catch(console.error);
}