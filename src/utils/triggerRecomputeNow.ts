import { admin as supabase } from '../../supabase/admin';

async function recomputeAllSessionsNow() {
  console.log('🚀 Starting immediate recomputation of all sessions...');
  
  // Get all completed sessions
  const { data: sessions, error } = await supabase
    .from('assessment_sessions')
    .select('id')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return;
  }

  console.log(`Found ${sessions?.length || 0} sessions to recompute`);
  
  let processed = 0;
  let failed = 0;
  
  for (const session of sessions || []) {
    try {
      console.log(`Processing session ${processed + 1}/${sessions.length}: ${session.id}`);
      
      const { data, error: invokeError } = await supabase.functions.invoke('enhanced-score-engine', {
        body: { session_id: session.id }
      });
      
      if (invokeError) {
        console.error(`❌ Failed session ${session.id}:`, invokeError);
        failed++;
      } else {
        console.log(`✅ Completed session ${session.id}`);
        processed++;
      }
      
      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (e) {
      console.error(`💥 Exception for session ${session.id}:`, e);
      failed++;
    }
  }
  
  // Update dashboard stats
  await supabase.rpc('update_dashboard_statistics');
  
  console.log(`\n🎉 Recomputation complete!`);
  console.log(`✅ Processed: ${processed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${sessions?.length}`);
}

// Execute immediately
recomputeAllSessionsNow();