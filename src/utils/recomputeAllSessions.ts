import { admin as supabase } from '../../supabase/admin';

export async function recomputeAllSessions() {
  console.log('🔄 Starting recompute of all sessions with enhanced scoring...');
  
  // Get all completed sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('assessment_sessions')
    .select('id, completed_at, email, user_id')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (sessionsError) {
    console.error('Error fetching sessions:', sessionsError);
    return { success: false, error: sessionsError };
  }

  console.log(`Found ${sessions?.length || 0} completed sessions to recompute`);

  if (!sessions || sessions.length === 0) {
    return { success: true, processed: 0, failed: [] };
  }

  let processed = 0;
  const failed: string[] = [];
  const batchSize = 10;

  // Process in batches to avoid overwhelming the system
  for (let i = 0; i < sessions.length; i += batchSize) {
    const batch = sessions.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(sessions.length/batchSize)} (${batch.length} sessions)`);

    // Process batch in parallel
    const batchPromises = batch.map(async (session) => {
      try {
        console.log(`Recomputing session ${session.id}...`);
        
        // Use the enhanced scoring engine instead of score_prism
        const { data, error } = await supabase.functions.invoke('enhanced-score-engine', {
          body: { session_id: session.id }
        });

        if (error) {
          console.error(`Failed to recompute session ${session.id}:`, error);
          failed.push(session.id);
          return false;
        }

        console.log(`✅ Recomputed session ${session.id}`);
        processed++;
        return true;
      } catch (e) {
        console.error(`Exception recomputing session ${session.id}:`, e);
        failed.push(session.id);
        return false;
      }
    });

    // Wait for batch to complete
    await Promise.all(batchPromises);
    
    // Small delay between batches
    if (i + batchSize < sessions.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Update dashboard statistics
  console.log('Updating dashboard statistics...');
  await supabase.rpc('update_dashboard_statistics');

  console.log(`✅ Recompute complete: ${processed} processed, ${failed.length} failed`);
  
  if (failed.length > 0) {
    console.log('Failed sessions:', failed);
  }

  return { success: true, processed, failed, total: sessions.length };
}