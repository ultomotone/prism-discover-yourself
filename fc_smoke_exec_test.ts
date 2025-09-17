// Direct execution test for score_fc_session
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gnkuikentdtnatazeriu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U'
);

const TEST_SESSIONS = [
  '618c5ea6-aeda-4084-9156-0aac9643afd3',
  '070d9bf2-516f-44ee-87fc-017c7db9d29c'
];

export async function executeFcSmokeTest() {
  console.log('🚀 EXECUTING FC SMOKE TEST');
  console.log('============================');
  
  const results = [];
  
  for (const sessionId of TEST_SESSIONS) {
    console.log(`\n🧪 Testing session: ${sessionId.substring(0,8)}...`);
    
    try {
      // Pre-test state
      const { data: preScores } = await supabase
        .from('fc_scores')
        .select('*')
        .eq('session_id', sessionId)
        .eq('version', 'v1.2');
        
      console.log(`  📊 Pre-test fc_scores: ${preScores?.length || 0} rows`);
      
      // Execute score_fc_session
      console.log(`  🎯 Invoking score_fc_session with v1.2...`);
      const { data: fnResult, error: fnError } = await supabase.functions.invoke('score_fc_session', {
        body: {
          session_id: sessionId,
          basis: 'functions', 
          version: 'v1.2'
        }
      });
      
      if (fnError) {
        console.log(`  ❌ Function error:`, fnError);
        results.push({ sessionId, success: false, error: fnError.message || fnError });
        continue;
      }
      
      console.log(`  ✅ Function response:`, fnResult);
      
      // Post-test verification
      const { data: postScores } = await supabase
        .from('fc_scores')
        .select('*')
        .eq('session_id', sessionId)
        .eq('version', 'v1.2');
        
      console.log(`  📊 Post-test fc_scores: ${postScores?.length || 0} rows`);
      
      if (postScores && postScores.length > 0) {
        const score = postScores[0];
        const scoreKeys = Object.keys(score.scores_json || {});
        console.log(`  🎯 Score details:`, {
          version: score.version,
          fc_kind: score.fc_kind, 
          blocks_answered: score.blocks_answered,
          score_functions: scoreKeys
        });
        
        results.push({
          sessionId,
          success: true,
          preCount: preScores?.length || 0,
          postCount: postScores?.length || 0,
          version: score.version,
          blocksAnswered: score.blocks_answered,
          scoreFunctions: scoreKeys,
          fnResult
        });
      } else {
        console.log(`  ⚠️  No fc_scores created`);
        results.push({
          sessionId,
          success: false,
          error: 'No fc_scores created',
          fnResult
        });
      }
      
    } catch (error) {
      console.log(`  ❌ Test error:`, error);
      results.push({
        sessionId,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  // Summary
  const passed = results.filter(r => r.success).length;
  console.log(`\n📋 EXECUTION SUMMARY`);
  console.log(`====================`);
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${results.length - passed}/${results.length}`);
  
  if (passed === results.length) {
    console.log(`🎉 ALL TESTS PASSED - FC PIPELINE OPERATIONAL`);
  } else {
    console.log(`⚠️  TESTS FAILED - Investigation needed`);
  }
  
  return results;
}

// Execute immediately if run directly
executeFcSmokeTest();