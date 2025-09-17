import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = "https://gnkuikentdtnatazeriu.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function runBackfillApply() {
  console.log('=== BF-01-APPLY: Staging Backfill ===');
  
  // Load the backfill plan
  let plan;
  try {
    const planData = fs.readFileSync('jobs/backfill_apply.plan.json', 'utf8');
    plan = JSON.parse(planData);
    console.log('✅ Loaded backfill plan:', plan.backfill_plan);
  } catch (err) {
    console.error('❌ Failed to load backfill plan:', err);
    return { success: false, error: 'Missing backfill plan' };
  }
  
  // Prechecks
  console.log('\n1. Running prechecks...');
  const { data: candidates, error: candidatesError } = await supabase
    .from('assessment_sessions')
    .select('id, created_at, status')
    .gte('created_at', '2025-08-01')
    .eq('status', 'completed');
    
  if (candidatesError) {
    console.error('❌ Precheck failed:', candidatesError);
    return { success: false, error: candidatesError };
  }
  
  console.log(`✅ Found ${candidates?.length || 0} candidate sessions since 2025-08-01`);
  
  // Execute batches
  console.log('\n2. Executing backfill batches...');
  const results = {
    processed: 0,
    fcSuccess: 0,
    profileSuccess: 0,
    errors: []
  };
  
  const throttleMs = 60000 / 20; // 20 per minute = 3000ms between calls
  
  for (const batch of plan.batches) {
    console.log(`\nProcessing batch: ${batch.batch_id} (${batch.sessions?.length || batch.session_count || 0} sessions)`);
    
    const sessionIds = batch.sessions || [];
    
    for (const sessionId of sessionIds) {
      try {
        console.log(`  Processing session: ${sessionId}`);
        
        // Step 1: score_fc_session
        const { data: fcData, error: fcError } = await supabase.functions.invoke('score_fc_session', {
          body: { session_id: sessionId, version: 'v1.2', basis: 'functions' }
        });
        
        if (fcError) {
          console.error(`    ❌ FC scoring failed: ${fcError.message}`);
          results.errors.push({ session_id: sessionId, step: 'fc', error: fcError.message });
        } else {
          console.log(`    ✅ FC scoring completed`);
          results.fcSuccess++;
        }
        
        // Step 2: score_prism  
        const { data: prismData, error: prismError } = await supabase.functions.invoke('score_prism', {
          body: { session_id: sessionId }
        });
        
        if (prismError) {
          console.error(`    ❌ PRISM scoring failed: ${prismError.message}`);
          results.errors.push({ session_id: sessionId, step: 'prism', error: prismError.message });
        } else {
          console.log(`    ✅ PRISM scoring completed`);
          results.profileSuccess++;
        }
        
        results.processed++;
        
        // Throttle to respect rate limit
        if (sessionIds.length > 1) {
          await new Promise(resolve => setTimeout(resolve, throttleMs));
        }
        
      } catch (err) {
        console.error(`    ❌ Unexpected error: ${err}`);
        results.errors.push({ session_id: sessionId, step: 'unexpected', error: String(err) });
      }
    }
  }
  
  // Generate audit logs
  console.log('\n3. Generating audit logs...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  const summary = {
    timestamp,
    plan: plan.backfill_plan,
    results,
    success_rate: results.processed > 0 ? {
      fc: (results.fcSuccess / results.processed * 100).toFixed(1),
      profiles: (results.profileSuccess / results.processed * 100).toFixed(1)
    } : { fc: '0', profiles: '0' }
  };
  
  // Write summary
  fs.writeFileSync('backfill_summary.md', `# Backfill Summary - ${timestamp}

## Plan Executed
- Version: ${plan.backfill_plan.version}
- Engine Version: ${plan.backfill_plan.engine_version}  
- FC Version: ${plan.backfill_plan.fc_version}
- Throttle: ${plan.backfill_plan.throttle_per_minute}/min

## Results
- Sessions Processed: ${results.processed}
- FC Scoring Success: ${results.fcSuccess} (${summary.success_rate.fc}%)
- Profile Scoring Success: ${results.profileSuccess} (${summary.success_rate.profiles}%)
- Errors: ${results.errors.length}

## Error Details
${results.errors.map(e => `- Session ${e.session_id} (${e.step}): ${e.error}`).join('\n')}

## Status
${results.errors.length === 0 ? '✅ BACKFILL COMPLETED SUCCESSFULLY' : '⚠️ BACKFILL COMPLETED WITH ERRORS'}
`);

  // Generate rollback script
  const rollbackSql = `-- Backfill Rollback - ${timestamp}
-- Remove fc_scores created during this backfill
DELETE FROM public.fc_scores 
WHERE version = 'v1.2' 
  AND created_at >= '${timestamp.split('T')[0]}T00:00:00Z'
  AND session_id IN (${sessionIds.map(id => `'${id}'`).join(',')});

-- Remove profiles created during this backfill  
DELETE FROM public.profiles
WHERE results_version = 'v1.2.1'
  AND updated_at >= '${timestamp.split('T')[0]}T00:00:00Z'
  AND session_id IN (${sessionIds.map(id => `'${id}'`).join(',')});
`;

  fs.writeFileSync(`jobs/backfill_rollback.${timestamp.split('T')[0]}.sql`, rollbackSql);
  
  console.log('✅ Audit logs written:');
  console.log('  - backfill_summary.md');  
  console.log(`  - jobs/backfill_rollback.${timestamp.split('T')[0]}.sql`);
  
  const success = results.errors.length === 0;
  console.log(`\n=== BACKFILL ${success ? 'COMPLETED SUCCESSFULLY' : 'COMPLETED WITH ERRORS'} ===`);
  
  return { success, results: summary };
}

// Run if called directly
runBackfillApply().then(result => {
  console.log('\nBackfill apply result:', result.success ? 'SUCCESS' : 'PARTIAL/FAILED');
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});