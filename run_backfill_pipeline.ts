import { runStagingBackfillApply } from './run_backfill_staging_apply.js';
import { runStagingSoak } from './run_staging_soak_monitor.js';  
import { runProdHealthCheck } from './run_prod_health_check.js';

console.log('🚀 BACKFILL PIPELINE ORCHESTRATOR');
console.log('=====================================');

async function runBackfillPipeline() {
  try {
    // PHASE 1: BACKFILL (Staging) — APPLY (Guarded)
    console.log('\n📦 PHASE 1: BACKFILL (Staging) — APPLY (Guarded)');
    console.log('Running staged backfill plan (~39 sessions) with throttle 20/min...');
    
    const backfillResult = await runStagingBackfillApply();
    
    if (!backfillResult.success) {
      console.log('❌ BACKFILL FAILED - Pipeline halted');
      return { phase: 'backfill', success: false, error: backfillResult.error };
    }
    
    console.log('✅ BACKFILL COMPLETE');
    console.log('📁 Artifacts generated: backfill_logs/*, backfill_summary.md, rollback script');
    console.log('\n⏸️  HALTING FOR REVIEW');
    console.log('👀 Please review backfill_summary.md before proceeding to staging soak');
    console.log('🔄 To continue: Run staging soak manually or approve continuation');
    
    // For now, we halt here to allow review
    // In a real scenario, this would wait for manual approval
    console.log('\n🎯 BACKFILL PHASE COMPLETE - READY FOR STAGING SOAK');
    
    return { phase: 'backfill', success: true, ready_for_soak: true };
    
  } catch (error) {
    console.error('❌ Pipeline failed:', error);
    return { phase: 'pipeline', success: false, error };
  }
}

// Execute the pipeline
runBackfillPipeline().then(result => {
  if (result.success) {
    console.log('\n🎉 PIPELINE PHASE COMPLETE');
    console.log('📋 Next Steps:');
    console.log('  1. Review backfill_summary.md');
    console.log('  2. Run staging soak: node run_staging_soak_monitor.ts');
    console.log('  3. Run prod health check: node run_prod_health_check.ts');
  } else {
    console.log('\n💥 PIPELINE FAILED');
    console.log(`❌ Failed at phase: ${result.phase}`);
  }
  
  process.exit(result.success ? 0 : 1);
});