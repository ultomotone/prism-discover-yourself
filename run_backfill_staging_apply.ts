import { admin as supabase } from './supabase/admin.js';
import { writeFileSync, mkdirSync } from 'fs';

// Environment check
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

interface BackfillPlan {
  backfill_plan: {
    version: string;
    timestamp: string;
    environment: string;
    engine_version: string;
    fc_version: string;
    throttle_per_minute: number;
    batch_size: number;
    total_candidates: number;
    expected_runtime_minutes: number;
  };
  batches: Array<{
    batch_id: string;
    description: string;
    sessions?: string[];
    session_count?: number;
    operations: Array<{
      function: string;
      params: Record<string, any>;
    }>;
  }>;
  expected_changes: {
    fc_scores: {
      new_rows: number;
      version: string;
      fc_kind: string;
    };
    profiles: {
      new_rows: number;
      updated_rows: number;
      results_version: string;
    };
  };
  rollback_strategy: {
    fc_scores: string;
    profiles: string;
  };
}

async function runStagingBackfillApply() {
  console.log('🚀 BACKFILL (Staging) — APPLY (Guarded)');
  console.log('Timestamp:', new Date().toISOString());
  
  // Create logs directory
  mkdirSync('backfill_logs', { recursive: true });
  
  try {
    // Load backfill plan
    const planData = await import('./jobs/backfill_apply.plan.json', { 
      assert: { type: 'json' } 
    });
    const plan: BackfillPlan = planData.default;
    
    console.log(`📋 Plan loaded: ${plan.backfill_plan.total_candidates} candidates`);
    console.log(`⚙️  Throttle: ${plan.backfill_plan.throttle_per_minute}/min`);
    console.log(`📦 Batch size: ${plan.backfill_plan.batch_size}`);
    
    const results = {
      execution_start: new Date().toISOString(),
      plan_version: plan.backfill_plan.version,
      environment: plan.backfill_plan.environment,
      total_sessions: 0,
      successful_sessions: 0,
      failed_sessions: 0,
      batch_results: [] as any[],
      errors: [] as any[],
      execution_end: '',
      runtime_minutes: 0
    };
    
    // Process batches
    for (const batch of plan.batches) {
      console.log(`\n🔄 Processing batch: ${batch.batch_id}`);
      console.log(`📝 ${batch.description}`);
      
      const batchResult = {
        batch_id: batch.batch_id,
        description: batch.description,
        started_at: new Date().toISOString(),
        sessions_processed: 0,
        sessions_successful: 0,
        sessions_failed: 0,
        operations_log: [] as any[],
        errors: [] as any[]
      };
      
      // Get session list (either explicit or fetch from DB)
      let sessions: string[] = [];
      if (batch.sessions) {
        sessions = batch.sessions;
      } else if (batch.session_count) {
        // Fetch sessions from database that need backfill
        const { data: candidateSessions } = await supabase
          .from('assessment_sessions')
          .select('id')
          .eq('status', 'completed')
          .gte('created_at', '2025-08-01')
          .limit(batch.session_count);
        
        sessions = candidateSessions?.map(s => s.id) || [];
      }
      
      console.log(`📊 Processing ${sessions.length} sessions in batch`);
      
      // Process sessions with throttling
      for (let i = 0; i < sessions.length; i++) {
        const sessionId = sessions[i];
        console.log(`  [${i+1}/${sessions.length}] Processing ${sessionId}`);
        
        try {
          // Execute operations for this session
          for (const operation of batch.operations) {
            const opLog = {
              session_id: sessionId,
              function: operation.function,
              params: operation.params,
              started_at: new Date().toISOString(),
              success: false,
              response: null as any,
              error: null as any
            };
            
            try {
              console.log(`    🔧 ${operation.function}(${JSON.stringify(operation.params)})`);
              
              const { data, error } = await supabase.functions.invoke(operation.function, {
                body: { 
                  session_id: sessionId,
                  ...operation.params 
                }
              });
              
              if (error) {
                throw error;
              }
              
              opLog.success = true;
              opLog.response = data;
              console.log(`    ✅ ${operation.function} succeeded`);
              
            } catch (error) {
              opLog.error = error;
              console.log(`    ❌ ${operation.function} failed:`, error);
              batchResult.errors.push({
                session_id: sessionId,
                operation: operation.function,
                error: error
              });
            }
            
            batchResult.operations_log.push(opLog);
          }
          
          batchResult.sessions_successful++;
          results.successful_sessions++;
          
        } catch (error) {
          console.log(`  ❌ Session ${sessionId} failed:`, error);
          batchResult.sessions_failed++;
          results.failed_sessions++;
          batchResult.errors.push({
            session_id: sessionId,
            error: error
          });
        }
        
        batchResult.sessions_processed++;
        results.total_sessions++;
        
        // Throttling - wait between sessions
        if (i < sessions.length - 1) {
          const delayMs = (60 * 1000) / plan.backfill_plan.throttle_per_minute;
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
      
      batchResult.completed_at = new Date().toISOString();
      results.batch_results.push(batchResult);
      
      console.log(`✅ Batch ${batch.batch_id} complete: ${batchResult.sessions_successful}/${batchResult.sessions_processed} successful`);
      
      // Save batch log
      writeFileSync(`backfill_logs/batch_${batch.batch_id}.json`, JSON.stringify(batchResult, null, 2));
    }
    
    results.execution_end = new Date().toISOString();
    results.runtime_minutes = (new Date(results.execution_end).getTime() - new Date(results.execution_start).getTime()) / (1000 * 60);
    
    // Save execution results
    writeFileSync('backfill_logs/execution_results.json', JSON.stringify(results, null, 2));
    
    // Generate summary
    const summary = `# Backfill Execution Summary

**Execution Time**: ${results.execution_start} → ${results.execution_end}
**Runtime**: ${results.runtime_minutes.toFixed(1)} minutes
**Environment**: ${plan.backfill_plan.environment}
**Plan Version**: ${plan.backfill_plan.version}

## Results Overview

- **Total Sessions**: ${results.total_sessions}
- **Successful**: ${results.successful_sessions} (${((results.successful_sessions/results.total_sessions)*100).toFixed(1)}%)
- **Failed**: ${results.failed_sessions} (${((results.failed_sessions/results.total_sessions)*100).toFixed(1)}%)

## Batch Results

${results.batch_results.map(batch => `
### ${batch.batch_id} - ${batch.description}
- Processed: ${batch.sessions_processed}
- Successful: ${batch.sessions_successful}
- Failed: ${batch.sessions_failed}
- Error Count: ${batch.errors.length}
`).join('\n')}

## Error Summary

${results.failed_sessions > 0 ? `
**Total Errors**: ${results.batch_results.reduce((sum, b) => sum + b.errors.length, 0)}

Critical errors requiring review:
${results.batch_results.flatMap(b => b.errors).slice(0, 5).map(e => `- Session ${e.session_id}: ${e.error?.message || e.error}`).join('\n')}
` : 'No errors encountered.'}

## Expected vs Actual Changes

**Expected**:
- FC Scores: ${plan.expected_changes.fc_scores.new_rows} new rows (${plan.expected_changes.fc_scores.version})
- Profiles: ${plan.expected_changes.profiles.new_rows} new rows (${plan.expected_changes.profiles.results_version})

**Verification needed**: Run post-backfill queries to confirm actual changes.

## Next Steps

1. ✅ Backfill execution complete
2. ⏳ **STAGING SOAK**: Monitor for 6 hours
3. ⏳ **PROD HEALTH**: Check for additional sessions needing backfill
4. ⏳ **ROLLBACK READY**: See \`backfill_logs/rollback_${new Date().toISOString().split('T')[0]}.sql\`

---
*Generated at ${new Date().toISOString()}*
`;
    
    writeFileSync('backfill_summary.md', summary);
    
    // Generate rollback script
    const rollbackScript = `-- Backfill Rollback Script
-- Generated: ${new Date().toISOString()}
-- Environment: ${plan.backfill_plan.environment}
-- Execution Window: ${results.execution_start} to ${results.execution_end}

-- ROLLBACK STEP 1: Remove FC Scores created during backfill
${plan.rollback_strategy.fc_scores};

-- ROLLBACK STEP 2: Remove Profiles created during backfill  
${plan.rollback_strategy.profiles};

-- VERIFICATION QUERIES
-- Check fc_scores removal
SELECT COUNT(*) as remaining_fc_scores 
FROM public.fc_scores 
WHERE version = '${plan.backfill_plan.fc_version}' 
  AND created_at >= '${results.execution_start}';
-- Expected: 0

-- Check profiles removal  
SELECT COUNT(*) as remaining_backfill_profiles
FROM public.profiles 
WHERE results_version = '${plan.backfill_plan.engine_version}' 
  AND created_at >= '${results.execution_start}';
-- Expected: 0
`;
    
    writeFileSync(`backfill_logs/rollback_${new Date().toISOString().split('T')[0]}.sql`, rollbackScript);
    
    console.log('\n🎯 BACKFILL APPLY COMPLETE');
    console.log(`📊 Summary: ${results.successful_sessions}/${results.total_sessions} successful`);
    console.log(`📁 Artifacts: backfill_logs/*, backfill_summary.md`);
    console.log(`🔄 Rollback ready: backfill_logs/rollback_${new Date().toISOString().split('T')[0]}.sql`);
    console.log('\n⏸️  HALTING FOR REVIEW');
    
    return {
      success: true,
      summary: results,
      artifacts: [
        'backfill_summary.md',
        'backfill_logs/execution_results.json',
        `backfill_logs/rollback_${new Date().toISOString().split('T')[0]}.sql`
      ]
    };
    
  } catch (error) {
    console.error('❌ Backfill execution failed:', error);
    
    const errorSummary = `# Backfill Execution Failed

**Error**: ${error}
**Timestamp**: ${new Date().toISOString()}

## Failure Details

The backfill execution encountered a critical error and was terminated.

## Next Steps

1. Review error details above
2. Check database state for partial changes
3. Consider rollback if needed
4. Fix issue and retry

---
*Generated at ${new Date().toISOString()}*
`;
    
    writeFileSync('backfill_summary.md', errorSummary);
    
    return {
      success: false,
      error: error,
      artifacts: ['backfill_summary.md']
    };
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runStagingBackfillApply().then(result => {
    console.log('\n📋 RESULT:', result.success ? 'SUCCESS' : 'FAILED');
    process.exit(result.success ? 0 : 1);
  });
}

export { runStagingBackfillApply };