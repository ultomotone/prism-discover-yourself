import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('evt:backfill_v11_start');

    // Get profiles that need v1.1 recomputation
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('session_id, results_version, score_fit_calibrated, type_code, created_at')
      .or(`results_version.neq.v1.1,score_fit_calibrated.is.null`)
      .order('created_at', { ascending: false });

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
              debug: false,
              force_recompute: true
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