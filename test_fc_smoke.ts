#!/usr/bin/env tsx

/**
 * IR-07B FC Smoke Test - Verify score_fc_session produces fc_scores
 * 
 * Usage: npx tsx test_fc_smoke.ts
 */

import { testFcScoring, runFcSmokeTests } from './src/utils/testFcScoring';

async function main() {
  console.log('🧪 IR-07B FC Smoke Test Starting...');
  console.log('=====================================');
  
  try {
    const results = await runFcSmokeTests();
    
    console.log('\n📊 SMOKE TEST RESULTS:');
    console.log('======================');
    
    let passCount = 0;
    let failCount = 0;
    
    for (const result of results) {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      const sessionShort = result.sessionId.substring(0, 8);
      
      console.log(`${status} Session ${sessionShort}:`);
      
      if (result.success) {
        passCount++;
        console.log(`  - FC Scores Created: ${result.fcScoresCount} rows`);
        console.log(`  - Blocks Answered: ${result.functionResult?.blocks_answered || 0}`);
        console.log(`  - Score Keys: ${Object.keys(result.functionResult?.scores || {}).join(', ')}`);
      } else {
        failCount++;
        console.log(`  - Error: ${result.error}`);
      }
      console.log('');
    }
    
    console.log('📋 SUMMARY:');
    console.log(`✅ Passed: ${passCount}/${results.length}`);
    console.log(`❌ Failed: ${failCount}/${results.length}`);
    console.log(`🎯 Success Rate: ${Math.round((passCount/results.length)*100)}%`);
    
    if (passCount === results.length) {
      console.log('\n🎉 ALL SMOKE TESTS PASSED - FC PIPELINE OPERATIONAL');
      console.log('✅ score_fc_session successfully produces fc_scores for v1.2');
      console.log('✅ Ready to proceed with backfill phase (IR-08A)');
    } else {
      console.log('\n⚠️  SMOKE TESTS FAILED - INVESTIGATE BEFORE BACKFILL');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Smoke test runner failed:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}