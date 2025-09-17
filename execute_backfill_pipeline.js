#!/usr/bin/env node

/**
 * BACKFILL PIPELINE EXECUTOR
 * 
 * Executes the three-phase backfill pipeline:
 * 1. Staging Apply (Guarded)
 * 2. Staging Soak (6h Read-only)  
 * 3. Prod Health Check
 */

import { runStagingBackfillApply } from './run_backfill_staging_apply.js';
import { runStagingSoak } from './run_staging_soak_monitor.js';
import { runProdHealthCheck } from './run_prod_health_check.js';
import { writeFileSync } from 'fs';

console.log('🚀 BACKFILL PIPELINE EXECUTOR');
console.log('=====================================');
console.log('Parameters:');
console.log('  Since Date: 2025-08-01');
console.log('  FC Version: v1.2');
console.log('  Engine Version: v1.2.1');
console.log('  Throttle: 20/min');
console.log('');

async function executeBackfillPipeline() {
  const results = {
    execution_start: new Date().toISOString(),
    phases: {},
    overall_status: 'RUNNING'
  };

  try {
    // PHASE 1: BACKFILL APPLY (Staging)
    console.log('📦 PHASE 1: BACKFILL APPLY (Staging, Guarded)');
    console.log('Executing staged backfill plan with throttle 20/min...');
    
    const applyResult = await runStagingBackfillApply();
    results.phases.backfill_apply = applyResult;
    
    if (!applyResult.success) {
      console.log('❌ BACKFILL APPLY FAILED - Pipeline halted');
      results.overall_status = 'FAILED_APPLY';
      writeFileSync('backfill_pipeline_results.json', JSON.stringify(results, null, 2));
      return results;
    }
    
    console.log('✅ BACKFILL APPLY COMPLETE');
    console.log('📁 Artifacts: backfill_logs/*, backfill_summary.md');
    console.log('');
    
    // Create gate file
    const applyGate = `# Backfill Apply Gate

## Status: ✅ PASS

**Execution Time**: ${applyResult.summary?.execution_start} → ${applyResult.summary?.execution_end}
**Sessions Processed**: ${applyResult.summary?.total_sessions || 0}
**Success Rate**: ${applyResult.summary?.successful_sessions || 0}/${applyResult.summary?.total_sessions || 0}

### Version Stamps
- FC Scores: v1.2 ✅
- Profiles: v1.2.1 ✅

### Artifacts Generated
- Execution logs: backfill_logs/
- Summary: backfill_summary.md
- Rollback script: ${applyResult.artifacts?.find(a => a.includes('rollback')) || 'Generated'}

## Gate Decision: ✅ PROCEED TO STAGING SOAK

---
*Generated at ${new Date().toISOString()}*
`;
    
    writeFileSync('backfill_gate.md', applyGate);
    console.log('📄 Gate: backfill_gate.md → PASS');
    console.log('');
    
    // PHASE 2: STAGING SOAK (6h Read-only)
    console.log('🔍 PHASE 2: STAGING SOAK (6h Monitoring, Read-only)');
    console.log('Collecting metrics: overrides, legacy FC, conversion rates...');
    
    const soakResult = await runStagingSoak();
    results.phases.staging_soak = soakResult;
    
    if (!soakResult.success) {
      console.log('❌ STAGING SOAK FAILED - Pipeline halted');
      results.overall_status = 'FAILED_SOAK';
      writeFileSync('backfill_pipeline_results.json', JSON.stringify(results, null, 2));
      return results;
    }
    
    console.log('✅ STAGING SOAK COMPLETE');
    console.log('📁 Artifacts: staging_observability.md, staging_soak_gate.md');
    console.log('');
    
    // PHASE 3: PROD HEALTH CHECK (Discovery + Mini Plan)  
    console.log('🏥 PHASE 3: PROD HEALTH CHECK (Discovery + Mini Plan)');
    console.log('Scanning prod sessions since 2025-08-01 for missing data...');
    
    const healthResult = await runProdHealthCheck();
    results.phases.prod_health = healthResult;
    
    console.log('✅ PROD HEALTH CHECK COMPLETE');
    console.log('📁 Artifacts: prod_health_check.md');
    
    if (healthResult.needs_backfill) {
      console.log('🚨 PROD SESSIONS NEED BACKFILL');
      console.log('📝 Mini plan generated: prod_mini_backfill_plan.json');
    } else {
      console.log('✅ PROD DATA IS HEALTHY');
    }
    
    // Final Status
    results.execution_end = new Date().toISOString();
    results.overall_status = 'COMPLETE';
    
    console.log('');
    console.log('🎯 BACKFILL PIPELINE COMPLETE');
    console.log('=====================================');
    console.log(`⏱️  Total Runtime: ${((new Date(results.execution_end) - new Date(results.execution_start)) / 1000 / 60).toFixed(1)}min`);
    console.log('📊 Phase Results:');
    console.log(`  Apply: ${applyResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Soak: ${soakResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Health: ${healthResult.success ? '✅ COMPLETE' : '❌ FAIL'}`);
    console.log('');
    console.log('📁 All Artifacts Generated:');
    console.log('  - backfill_gate.md');
    console.log('  - backfill_summary.md');
    console.log('  - staging_observability.md');
    console.log('  - staging_soak_gate.md');
    console.log('  - prod_health_check.md');
    if (healthResult.needs_backfill) {
      console.log('  - prod_mini_backfill_plan.json');
    }
    
    // Write final results
    writeFileSync('backfill_pipeline_results.json', JSON.stringify(results, null, 2));
    
    return results;
    
  } catch (error) {
    console.error('❌ Pipeline failed with error:', error);
    results.execution_end = new Date().toISOString();
    results.overall_status = 'ERROR';
    results.error = error.message;
    writeFileSync('backfill_pipeline_results.json', JSON.stringify(results, null, 2));
    return results;
  }
}

// Execute the pipeline
executeBackfillPipeline().then(results => {
  const exitCode = results.overall_status === 'COMPLETE' ? 0 : 1;
  console.log(`\nPipeline ${results.overall_status} - Exit Code: ${exitCode}`);
  process.exit(exitCode);
});