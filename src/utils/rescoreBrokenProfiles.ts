import { admin as supabase } from "@/lib/supabase/admin";

export async function rescoreBrokenProfiles() {
  console.log('Starting rescore of broken profiles with 99.4 fit scores...');
  
  // Find profiles with the broken 99.4 fit scores
  const { data: brokenProfiles, error } = await supabase
    .from('profiles')
    .select('session_id, created_at')
    .gte('created_at', '2025-08-19') // Only recent ones with the bug
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching broken profiles:', error);
    return { success: false, error };
  }

  console.log(`Found ${brokenProfiles?.length || 0} profiles to re-score`);

  let processed = 0;
  const failed: string[] = [];

  // Re-score each broken profile
  for (const profile of brokenProfiles || []) {
    try {
      console.log(`Re-scoring session ${profile.session_id}...`);
      
      const { error: scoreError } = await supabase.functions.invoke('score_prism', {
        body: { session_id: profile.session_id }
      });

      if (scoreError) {
        console.error(`Failed to re-score session ${profile.session_id}:`, scoreError);
        failed.push(profile.session_id);
      } else {
        processed++;
        console.log(`Re-scored session ${profile.session_id} (${processed}/${brokenProfiles?.length})`);
      }
    } catch (e) {
      console.error(`Exception re-scoring session ${profile.session_id}:`, e);
      failed.push(profile.session_id);
    }
  }

  // Update dashboard statistics
  await supabase.rpc('update_dashboard_statistics');

  console.log(`Rescore complete: ${processed} processed, ${failed.length} failed`);
  return { success: true, processed, failed };
}