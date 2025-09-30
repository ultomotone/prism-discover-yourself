import { createClient } from '@supabase/supabase-js';

const url = "https://gnkuikentdtnatazeriu.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function recomputeAllSessions() {
  console.log('🔄 Recomputing all completed sessions...\n');
  
  // Get all completed sessions
  const { data: sessions, error } = await supabase
    .from('assessment_sessions')
    .select('id, completed_at')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });
    
  if (error) {
    console.error('❌ Failed to fetch sessions:', error);
    return { success: false, error };
  }
  
  console.log(`📊 Found ${sessions?.length || 0} completed sessions\n`);
  
  const results = {
    total: sessions?.length || 0,
    success: 0,
    failed: 0,
    errors: [] as any[]
  };
  
  // Process in batches to avoid rate limits
  const batchSize = 10;
  const throttleMs = 1000; // 1 second between batches
  
  for (let i = 0; i < (sessions?.length || 0); i += batchSize) {
    const batch = sessions!.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil((sessions?.length || 0)/batchSize)}`);
    
    await Promise.all(
      batch.map(async (session) => {
        try {
          // Call recompute-session edge function
          const { data, error } = await supabase.functions.invoke('recompute-session', {
            body: { session_id: session.id, dry_run: false }
          });
          
          if (error) {
            console.error(`  ❌ ${session.id}: ${error.message}`);
            results.failed++;
            results.errors.push({ session_id: session.id, error: error.message });
          } else {
            console.log(`  ✅ ${session.id}`);
            results.success++;
          }
        } catch (err) {
          console.error(`  ❌ ${session.id}: ${err}`);
          results.failed++;
          results.errors.push({ session_id: session.id, error: String(err) });
        }
      })
    );
    
    // Throttle between batches
    if (i + batchSize < (sessions?.length || 0)) {
      await new Promise(resolve => setTimeout(resolve, throttleMs));
    }
  }
  
  console.log('\n📈 Recomputation Summary:');
  console.log(`  Total: ${results.total}`);
  console.log(`  Success: ${results.success}`);
  console.log(`  Failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(e => {
      console.log(`  ${e.session_id}: ${e.error}`);
    });
  }
  
  return { success: results.failed === 0, results };
}

recomputeAllSessions().then(result => {
  console.log('\n' + (result.success ? '✅ Complete' : '⚠️ Complete with errors'));
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
