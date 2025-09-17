#!/usr/bin/env node

/**
 * SEQUENTIAL PHASE EXECUTOR
 * Runs each phase individually with proper gates and halts
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, existsSync } from 'fs';

const execAsync = promisify(exec);

async function runPhase(phaseScript, phaseName) {
  console.log(`\n🚀 EXECUTING: ${phaseName}`);
  console.log('='.repeat(50));
  
  try {
    const { stdout, stderr } = await execAsync(`node ${phaseScript}`);
    
    if (stderr) {
      console.error(`❌ ${phaseName} Errors:`, stderr);
    }
    
    console.log(stdout);
    
    // Check if the script succeeded (exit code 0)
    return { success: true, output: stdout, error: stderr };
    
  } catch (error) {
    console.error(`❌ ${phaseName} FAILED:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🎯 BACKFILL PIPELINE - SEQUENTIAL EXECUTION');
  console.log('Parameters: since=2025-08-01, fc=v1.2, engine=v1.2.1, throttle=20/min');
  console.log('');

  // PHASE 1: Backfill Apply (Staging)
  const applyResult = await runPhase('run_backfill_staging_apply.ts', 'BACKFILL APPLY (Staging)');
  
  if (!applyResult.success) {
    console.log('\n❌ PHASE 1 FAILED - HALTING PIPELINE');
    console.log('📋 Review backfill_summary.md for details');
    process.exit(1);
  }
  
  console.log('\n✅ PHASE 1 COMPLETE - HALTING FOR REVIEW');
  console.log('📋 Next: Review backfill_summary.md and backfill_logs/');
  console.log('📋 Then: node run_staging_soak_monitor.ts');
  
  // Create checkpoint
  writeFileSync('phase1_checkpoint.json', JSON.stringify({
    phase: 'backfill_apply',
    status: 'complete',
    timestamp: new Date().toISOString(),
    next_phase: 'staging_soak'
  }, null, 2));
  
  console.log('\n🎯 PHASE 1 CHECKPOINT CREATED');
  console.log('Pipeline halted for manual review and approval.');
}

main().catch(console.error);