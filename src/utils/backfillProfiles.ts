import { admin as supabase } from "@/lib/supabase/admin";

export async function backfillMissingProfiles() {
  console.log('Starting profile backfill...');
  
  // Get sessions without profiles
  const { data: missingSessions, error } = await supabase
    .from('assessment_sessions')
    .select('id')
    .eq('status', 'completed')
    .not('id', 'in', `(SELECT session_id FROM profiles WHERE session_id IS NOT NULL)`);

  if (error) {
    console.error('Error fetching missing sessions:', error);
    return { success: false, error };
  }

  console.log(`Found ${missingSessions?.length || 0} missing profiles`);

  let processed = 0;
  const failed: string[] = [];

  // Process each missing session
  for (const session of missingSessions || []) {
    try {
        const { error: scoreError } = await supabase.functions.invoke('score_prism', {
          body: { session_id: session.id }
        });

      if (scoreError) {
        console.error(`Failed to score session ${session.id}:`, scoreError);
        failed.push(session.id);
      } else {
        processed++;
        console.log(`Processed session ${session.id} (${processed}/${missingSessions?.length})`);
      }
    } catch (e) {
      console.error(`Exception scoring session ${session.id}:`, e);
      failed.push(session.id);
    }
  }

  // Update dashboard statistics
  await supabase.rpc('update_dashboard_statistics');

  console.log(`Backfill complete: ${processed} processed, ${failed.length} failed`);
  return { success: true, processed, failed };
}