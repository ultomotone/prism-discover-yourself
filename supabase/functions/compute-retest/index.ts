import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[compute-retest] Starting retest computation');

    const resultsVersion = 'v1.2.1';

    // Get retest pairs from view
    const { data: pairs, error: pairsError } = await supabase
      .rpc('exec_sql', {
        q: `SELECT user_id, first_session_id, second_session_id, results_version, days_between 
            FROM v_retest_pairs 
            WHERE results_version = '${resultsVersion}'`
      });

    if (pairsError) throw pairsError;

    const retestPairs = pairs || [];
    console.log(`[compute-retest] Found ${retestPairs.length} candidate pairs`);

    if (retestPairs.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No retest pairs found',
          pairs_processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get scale sums for all sessions
    const { data: scaleSums, error: sumsError } = await supabase
      .rpc('exec_sql', {
        q: `WITH scale_sums AS (
              SELECT 
                r.session_id, 
                COALESCE(sk.tag, sk.scale_type::text) AS scale_code,
                SUM(r.answer_numeric)::numeric AS scale_sum
              FROM assessment_responses r
              JOIN assessment_scoring_key sk ON sk.question_id = r.question_id
              WHERE sk.scale_type != 'META' 
                AND sk.tag IS NOT NULL
                AND r.answer_numeric IS NOT NULL
              GROUP BY r.session_id, COALESCE(sk.tag, sk.scale_type::text)
            )
            SELECT session_id, scale_code, scale_sum 
            FROM scale_sums`
      });

    if (sumsError) throw sumsError;

    // Build lookup map
    const scaleMap = new Map<string, Map<string, number>>();
    (scaleSums || []).forEach((row: any) => {
      if (!scaleMap.has(row.session_id)) scaleMap.set(row.session_id, new Map());
      scaleMap.get(row.session_id)!.set(row.scale_code, parseFloat(row.scale_sum));
    });

    // Compute correlations for each pair
    let inserted = 0;
    for (const pair of retestPairs) {
      const s1Sums = scaleMap.get(pair.first_session_id);
      const s2Sums = scaleMap.get(pair.second_session_id);

      if (!s1Sums || !s2Sums) continue;

      // Find common scales
      const commonScales = Array.from(s1Sums.keys()).filter(sc => s2Sums.has(sc));
      if (commonScales.length < 3) continue;

      // Compute Pearson correlation
      const vec1 = commonScales.map(sc => s1Sums.get(sc)!);
      const vec2 = commonScales.map(sc => s2Sums.get(sc)!);

      const n = vec1.length;
      const mean1 = vec1.reduce((a, b) => a + b, 0) / n;
      const mean2 = vec2.reduce((a, b) => a + b, 0) / n;

      let numerator = 0;
      let sumSq1 = 0;
      let sumSq2 = 0;

      for (let i = 0; i < n; i++) {
        const diff1 = vec1[i] - mean1;
        const diff2 = vec2[i] - mean2;
        numerator += diff1 * diff2;
        sumSq1 += diff1 * diff1;
        sumSq2 += diff2 * diff2;
      }

      const r = numerator / Math.sqrt(sumSq1 * sumSq2);

      if (isNaN(r) || !isFinite(r)) continue;

      // Insert result
      const { error: insertError } = await supabase
        .from('psychometrics_retest_pairs')
        .upsert({
          user_id: pair.user_id,
          scale_code: 'ALL_SCALES',
          first_session_id: pair.first_session_id,
          second_session_id: pair.second_session_id,
          days_between: pair.days_between,
          r_pearson: Math.round(r * 10000) / 10000,
          n_items: commonScales.length,
          results_version: resultsVersion
        }, {
          onConflict: 'user_id,first_session_id,second_session_id,scale_code'
        });

      if (insertError) {
        console.error(`[compute-retest] Insert error:`, insertError);
      } else {
        inserted++;
      }
    }

    console.log(`[compute-retest] Completed: ${inserted} pairs processed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pairs_processed: inserted,
        pairs_found: retestPairs.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[compute-retest] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
