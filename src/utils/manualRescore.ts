import { supabase } from "@/integrations/supabase/client";

export async function manualRescoreLatest(count: number = 30) {
  console.log(`Manual rescoring of latest ${count} sessions via RPC...`);
  
  try {
    // Use SECURITY DEFINER RPC to fetch recent session_ids (bypasses profiles RLS)
    const { data: recent, error: rpcError } = await supabase
      .rpc('get_recent_assessments_safe');

    if (rpcError) {
      console.error('Error fetching recent assessments via RPC:', rpcError);
      return { error: rpcError };
    }

    const sessionIds: string[] = (recent || [])
      .map((r: any) => r.session_id)
      .filter(Boolean)
      .slice(0, count);

    if (sessionIds.length === 0) {
      console.log('No recent sessions found to rescore');
      return { message: 'No recent sessions found' };
    }

    let successCount = 0;
    let errorCount = 0;
    const results: Array<{ session_id: string; status: string }> = [];

    for (const session_id of sessionIds) {
      try {
        const { error } = await supabase.functions.invoke('score_prism', {
          body: { session_id }
        });

        if (error) {
          console.error(`Error rescoring ${session_id}:`, error);
          results.push({ session_id, status: 'error' });
          errorCount++;
        } else {
          successCount++;
          results.push({ session_id, status: 'success' });
        }

        // short delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 250));
      } catch (err) {
        console.error(`Exception rescoring ${session_id}:`, err);
        results.push({ session_id, status: 'exception' });
        errorCount++;
      }
    }

    await supabase.rpc('update_dashboard_statistics');

    return {
      total: sessionIds.length,
      successful: successCount,
      failed: errorCount,
      results,
    };
  } catch (error) {
    console.error('Fatal error during manual rescore:', error);
    return { error };
  }
}

// Expose helper for console/manual triggering
;(window as any).manualRescoreLatest = manualRescoreLatest;
