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
    const supabase = createServiceClient();

    // Parse options and build dynamic query
    const url = new URL(req.url);
    let body: any = {};
    try { body = await req.json(); } catch (_) {}

    const force_all = body.force_all === true || url.searchParams.get('force_all') === 'true';
    const days_back_param = body.days_back ?? (url.searchParams.get('days_back') ? parseInt(url.searchParams.get('days_back')!) : undefined);
    const limit_param = body.limit ?? (url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined);

    console.log(`evt:backfill_v11_start,force_all:${force_all},days_back:${days_back_param ?? 'NA'},limit:${limit_param ?? 'NA'}`);

    // Build base query
    let query = supabase
      .from('profiles')
      .select('session_id, results_version, score_fit_calibrated, type_code, created_at');

    if (force_all) {
      if (days_back_param) {
        const fromIso = new Date(Date.now() - days_back_param * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', fromIso);
      }
    } else {
      // only those missing current version or missing calibrated fit
      query = query.or('results_version.is.null,results_version.neq.v1.1.2,score_fit_calibrated.is.null');
    }

    query = query.order('created_at', { ascending: false });
    if (limit_param && typeof limit_param === 'number') {
      query = query.limit(limit_param);
    }

    let { data: profiles, error: fetchError } = await query;

    // Fallback: if no profiles matched and not forced, recompute recent 30 days
    if ((!profiles || profiles.length === 0) && !force_all) {
      console.log('evt:fallback_recent_30d');
      const fromIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: prof2, error: err2 } = await supabase
        .from('profiles')
        .select('session_id, results_version, score_fit_calibrated, type_code, created_at')
        .gte('created_at', fromIso)
        .order('created_at', { ascending: false });
      profiles = prof2;
      fetchError = err2;
    }

    if (fetchError) {
      console.error('evt:fetch_error', fetchError);
      return new Response(JSON.stringify({ error: fetchError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!profiles || profiles.length === 0) {
      console.log('evt:no_profiles_need_recompute');
      return new Response(JSON.stringify({ 
        message: 'No profiles need v1.1 recomputation',
        processed: 0,
        updated: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`evt:recompute_needed,total:${profiles.length}`);

    let processed = 0;
    let updated = 0;
    let errors = 0;
    const batchSize = 50;

    // Process in batches
    for (let i = 0; i < profiles.length; i += batchSize) {
      const batch = profiles.slice(i, i + batchSize);
      console.log(`evt:batch_start,batch:${Math.floor(i/batchSize) + 1},size:${batch.length}`);

      for (const profile of batch) {
        try {
          // Call score_prism edge function to recompute with v1.1 calibration
          const { data: scoreResult, error: scoreError } = await supabase.functions.invoke('score_prism', {
            body: {
              session_id: profile.session_id,
              debug: false
            }
          });

          processed++;

          if (scoreError) {
            console.error(`evt:score_error,session:${profile.session_id},error:${scoreError.message}`);
            errors++;
          } else if (scoreResult?.status === 'success') {
            updated++;
            if (updated % 10 === 0) {
              console.log(`evt:progress,updated:${updated},processed:${processed}`);
            }
          } else {
            console.error(`evt:score_failed,session:${profile.session_id},result:${JSON.stringify(scoreResult)}`);
            errors++;
          }

          // Small delay to be gentle on the system
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (err) {
          console.error(`evt:exception,session:${profile.session_id},error:${err.message}`);
          processed++;
          errors++;
        }
      }

      // Longer delay between batches
      if (i + batchSize < profiles.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`evt:backfill_complete,processed:${processed},updated:${updated},errors:${errors}`);

    return new Response(JSON.stringify({
      success: true,
      total_profiles: profiles.length,
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