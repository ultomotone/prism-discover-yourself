import { admin as supabase } from "../../supabase/admin";
import {
  findSessionsNeedingProfile,
  SessionRecord,
  ProfileRecord,
} from "../../supabase/functions/_shared/backfillUtils";

export async function backfillMissingProfiles() {
  console.log('Starting profile backfill...');
  
  // Load candidate sessions from last 90 days
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: candidateSessions, error: sessErr } = await supabase
    .from('assessment_sessions')
    .select('id,status,completed_questions,total_questions,completed_at')
    .in('status', ['completed', 'in_progress'])
    .gte('started_at', ninetyDaysAgo);

  if (sessErr) {
    console.error('Error fetching candidate sessions:', sessErr);
    return { success: false, error: sessErr };
  }

  const sessions = (candidateSessions || []) as SessionRecord[];
  const sessionIds = sessions.map((s) => s.id);

  // Load existing profiles
  const { data: existingProfiles, error: profErr } = await supabase
    .from('profiles')
    .select('session_id')
    .in('session_id', sessionIds);

  if (profErr) {
    console.error('Error fetching existing profiles:', profErr);
    return { success: false, error: profErr };
  }

  const missingSessions = findSessionsNeedingProfile(
    sessions,
    (existingProfiles as ProfileRecord[]) || [],
  );

  console.log(`Found ${missingSessions.length} sessions needing profiles`);

  let processed = 0;
  const failed: string[] = [];

  // Process each missing session
  for (const sess of missingSessions) {
    try {
      await supabase
        .from('assessment_sessions')
        .update({
          status: 'completed',
          completed_at: sess.completed_at || new Date().toISOString(),
          completed_questions: sess.completed_questions ?? sess.total_questions,
        })
        .eq('id', sess.id);

      const { error: scoreError } = await supabase.functions.invoke('enhanced-score-engine', {
        body: { session_id: sess.id },
      });

      if (scoreError) {
        console.error(`Failed to score session ${sess.id}:`, scoreError);
        failed.push(sess.id);
      } else {
        processed++;
        console.log(`Processed session ${sess.id} (${processed}/${missingSessions.length})`);
      }
    } catch (e) {
      console.error(`Exception scoring session ${sess.id}:`, e);
      failed.push(sess.id);
    }
  }

  // Update dashboard statistics
  await supabase.rpc('update_dashboard_statistics');

  console.log(`Backfill complete: ${processed} processed, ${failed.length} failed`);
  return { success: true, processed, failed };
}