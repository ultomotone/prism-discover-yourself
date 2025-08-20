import { supabase } from "@/integrations/supabase/client";

export async function manualRescoreLatest(count: number = 20) {
  console.log(`Manual rescoring of latest ${count} profiles...`);
  
  try {
    // Get the most recent profiles
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('session_id, created_at, type_code')
      .order('created_at', { ascending: false })
      .limit(count);

    if (fetchError) {
      console.error('Error fetching profiles:', fetchError);
      return { error: fetchError };
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profiles found to rescore');
      return { message: 'No profiles found' };
    }

    console.log(`Rescoring ${profiles.length} most recent profiles...`);
    
    let successCount = 0;
    let errorCount = 0;
    const results: Array<{ session_id: string; status: string; fit_score?: number }> = [];

    // Rescore each profile sequentially
    for (const profile of profiles) {
      try {
        console.log(`Rescoring ${profile.session_id} (${profile.type_code || 'unknown'})`);
        
        const { data, error } = await supabase.functions.invoke('score_prism', {
          body: { session_id: profile.session_id }
        });

        if (error) {
          console.error(`Error rescoring ${profile.session_id}:`, error);
          results.push({ session_id: profile.session_id, status: 'error' });
          errorCount++;
        } else {
          successCount++;
          results.push({ 
            session_id: profile.session_id, 
            status: 'success',
            fit_score: data?.fit_abs || 'unknown'
          });
          console.log(`✅ ${profile.session_id}: ${data?.fit_abs || 'N/A'}`);
        }
        
        // Short delay between requests
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (err) {
        console.error(`Exception rescoring ${profile.session_id}:`, err);
        results.push({ session_id: profile.session_id, status: 'exception' });
        errorCount++;
      }
    }

    // Update dashboard stats
    await supabase.rpc('update_dashboard_statistics');
    
    const summary = {
      total: profiles.length,
      successful: successCount,
      failed: errorCount,
      results: results
    };

    console.log('Manual rescore complete:', summary);
    return summary;

  } catch (error) {
    console.error('Fatal error during manual rescore:', error);
    return { error };
  }
}

// Export for easy console access
(window as any).manualRescoreLatest = manualRescoreLatest;