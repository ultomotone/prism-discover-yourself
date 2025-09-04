// @ts-nocheck
import { createServiceClient } from '../_shared/supabaseClient.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role to bypass RLS
    const supabase = createServiceClient();

    console.log('evt:backfill_start');

    // Get profiles that need v1.1 rescoring
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('session_id, version, type_scores, top_types, created_at')
      .or(`version.is.null,version.neq.v1.1,and(type_scores.not.is.null,top_types.not.is.null)`)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('evt:fetch_error', fetchError);
      return new Response(JSON.stringify({ error: fetchError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!profiles || profiles.length === 0) {
      console.log('evt:no_profiles_need_backfill');
      return new Response(JSON.stringify({ 
        message: 'No profiles need backfill',
        processed: 0,
        updated: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Filter profiles that need backfill based on fit_abs >= 95
    const needsBackfill = profiles.filter(p => {
      if (!p.version || p.version !== 'v1.1') return true;
      if (!p.type_scores || !p.top_types) return true;
      
      try {
        const topType = p.top_types[0];
        const fitAbs = p.type_scores[topType]?.fit_abs;
        return typeof fitAbs === 'number' && fitAbs >= 95;
      } catch {
        return true; // If we can't parse, it needs backfill
      }
    });

    console.log(`evt:backfill_needed,total:${profiles.length},needs_backfill:${needsBackfill.length}`);

    let processed = 0;
    let updated = 0;
    let errors = 0;
    const batchSize = 100;

    // Process in batches
    for (let i = 0; i < needsBackfill.length; i += batchSize) {
      const batch = needsBackfill.slice(i, i + batchSize);
      console.log(`evt:batch_start,batch:${Math.floor(i/batchSize) + 1},size:${batch.length}`);

      for (const profile of batch) {
        try {
          // Call score_prism edge function
          const { data: scoreResult, error: scoreError } = await supabase.functions.invoke('score_prism', {
            body: { session_id: profile.session_id, debug: false }
          });

          processed++;

          if (scoreError) {
            console.error(`evt:score_error,session:${profile.session_id},error:${scoreError.message}`);
            errors++;
          } else {
            updated++;
            if (updated % 10 === 0) {
              console.log(`evt:progress,updated:${updated},processed:${processed}`);
            }
          }

          // Small delay to be gentle
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (err) {
          console.error(`evt:exception,session:${profile.session_id},error:${err.message}`);
          processed++;
          errors++;
        }
      }

      // Longer delay between batches
      if (i + batchSize < needsBackfill.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`evt:backfill_complete,processed:${processed},updated:${updated},errors:${errors}`);

    return new Response(JSON.stringify({
      success: true,
      total_profiles: profiles.length,
      needed_backfill: needsBackfill.length,
      processed,
      updated,
      errors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('evt:fatal_error', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});