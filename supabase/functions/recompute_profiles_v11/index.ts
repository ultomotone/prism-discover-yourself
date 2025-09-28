import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const TARGET_VERSION = Deno.env.get('SCORING_VERSION') ?? 'v0';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse options and build dynamic query
    const url = new URL(req.url);
    let body: any = {};
    try { body = await req.json(); } catch (_) {}

    const force_all = body.force_all === true || url.searchParams.get('force_all') === 'true';
    const days_back_param = body.days_back ?? (url.searchParams.get('days_back') ? parseInt(url.searchParams.get('days_back')!) : undefined);
    const limit_param = body.limit ?? (url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined);
    const session_id = body.session_id ?? url.searchParams.get('session_id');
    const min_answers: number | undefined = body.min_answers ?? (url.searchParams.get('min_answers') ? parseInt(url.searchParams.get('min_answers')!) : undefined);
    const allow_partial: boolean = body.allow_partial === true || url.searchParams.get('allow_partial') === 'true';

    console.log(`evt:backfill_v11_start,force_all:${force_all},days_back:${days_back_param ?? 'NA'},limit:${limit_param ?? 'NA'},session:${session_id ?? 'NA'},min_answers:${min_answers ?? 'NA'},allow_partial:${allow_partial}`);

    // Single-session fast path
    if (session_id) {
      console.log(`evt:single_session,session:${session_id}`);
      const { data: scoreResult, error: scoreError } = await supabase.functions.invoke('score_prism', {
        body: { session_id, debug: false, partial_session: allow_partial },
      });

      const ok = !scoreError && scoreResult?.status === 'success';

      return new Response(
        JSON.stringify({
          success: ok,
          total_profiles: 1,
          processed: 1,
          updated: ok ? 1 : 0,
          errors: ok ? 0 : 1,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      query = query.or(`results_version.is.null,results_version.neq.${TARGET_VERSION},score_fit_calibrated.is.null`);
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

    // Optional filtering by minimum answers using RPC (completed sessions)
    if (typeof min_answers === 'number' && Number.isFinite(min_answers)) {
      try {
        const { data: minRows, error: minErr } = await supabase.rpc('sessions_with_min_answers', {
          min_answers,
          days_back: days_back_param ?? null,
        });
        if (minErr) {
          console.error('evt:min_answers_rpc_error', minErr);
        } else if (Array.isArray(minRows) && minRows.length > 0) {
          const allowed = new Set((minRows as any[]).map((r: any) => r.session_id));
          profiles = (profiles || []).filter((p) => allowed.has(p.session_id));
          console.log(`evt:min_answers_filter_applied,min_answers:${min_answers},remaining:${profiles.length}`);
        } else {
          console.log(`evt:min_answers_no_matches,min_answers:${min_answers}`);
          profiles = [];
        }
      } catch (e) {
        console.error('evt:min_answers_exception', (e as Error).message);
      }
    }

    if (!profiles || profiles.length === 0) {
      console.log('evt:no_profiles_need_recompute_after_filters');
      return new Response(
        JSON.stringify({
          message: `No profiles need ${TARGET_VERSION} recomputation`,
          processed: 0,
          updated: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Apply limit after filtering
    if (limit_param && profiles.length > limit_param) {
      profiles = profiles.slice(0, limit_param);
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
              debug: false,
              partial_session: allow_partial,
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
          console.error(`evt:exception,session:${profile.session_id},error:${(err as Error).message}`);
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
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
