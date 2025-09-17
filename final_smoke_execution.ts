#!/usr/bin/env tsx

/**
 * Final FC Smoke Execution - EXEC-01
 * Actually execute score_fc_session and verify fc_scores creation
 */

import { supabase } from "@/integrations/supabase/client";

async function executeAndVerifySmoke() {
  console.log('🎯 FINAL FC SMOKE EXECUTION');
  console.log('===========================');
  
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  const shortId = sessionId.substring(0, 8);
  
  console.log(`Testing session: ${shortId}`);
  console.log('Parameters: version=v1.2, basis=functions');
  
  try {
    // Pre-execution verification
    console.log('\n📋 Pre-execution checks...');
    
    const { data: preScores } = await supabase
      .from('fc_scores')
      .select('*')
      .eq('session_id', sessionId);
    
    console.log(`Pre-test fc_scores: ${preScores?.length || 0} rows`);
    
    // Execute score_fc_session
    console.log('\n🚀 Executing score_fc_session...');
    
    const { data, error } = await supabase.functions.invoke('score_fc_session', {
      body: {
        session_id: sessionId,
        version: 'v1.2',
        basis: 'functions'
      }
    });
    
    if (error) {
      console.log('❌ Function error:', error);
      return { success: false, error };
    }
    
    console.log('✅ Function response:', data);
    
    // Post-execution verification
    console.log('\n🔍 Post-execution verification...');
    
    const { data: postScores } = await supabase
      .from('fc_scores')
      .select('*')
      .eq('session_id', sessionId)
      .eq('version', 'v1.2');
    
    const fcScore = postScores?.[0];
    console.log(`Post-test fc_scores: ${postScores?.length || 0} rows`);
    
    if (fcScore) {
      console.log(`📊 Version: ${fcScore.version}`);
      console.log(`🎯 Blocks answered: ${fcScore.blocks_answered}`);
      console.log(`📈 Score keys: ${Object.keys(fcScore.scores_json || {}).join(', ')}`);
    }
    
    const success = !!(postScores?.length && fcScore?.version === 'v1.2');
    
    console.log(`\n🏁 SMOKE TEST RESULT: ${success ? '✅ PASS' : '❌ FAIL'}`);
    
    return {
      success,
      functionResult: data,
      fcScore,
      preCount: preScores?.length || 0,
      postCount: postScores?.length || 0
    };
    
  } catch (err) {
    console.log('❌ Exception:', err);
    return { success: false, error: err.message };
  }
}

// Execute
executeAndVerifySmoke().then(result => {
  if (result.success) {
    console.log('\n🎉 FC SMOKE TEST PASSED - READY FOR E2E');
  } else {
    console.log('\n⚠️ FC SMOKE TEST FAILED - BLOCKING');
    console.log('Error:', result.error);
  }
}).catch(console.error);