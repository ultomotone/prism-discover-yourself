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

    console.log('[compute-reliability] Starting reliability computation');

    const resultsVersion = 'v1.2.1';
    const cohortStart = '2025-09-01';
    const cohortEnd = new Date().toISOString().split('T')[0];

    // Get all scales from scoring key
    const { data: scales, error: scalesError } = await supabase
      .from('assessment_scoring_key')
      .select('scale_type, tag, question_id')
      .neq('scale_type', 'META')
      .not('tag', 'is', null);

    if (scalesError) throw scalesError;

    // Group by scale
    const scaleMap = new Map<string, number[]>();
    scales?.forEach((s: any) => {
      const key = s.tag || s.scale_type;
      if (!scaleMap.has(key)) scaleMap.set(key, []);
      scaleMap.get(key)!.push(s.question_id);
    });

    console.log(`[compute-reliability] Found ${scaleMap.size} scales to process`);

    // Get responses in date range
    const { data: sessions, error: sessionsError } = await supabase
      .from('assessment_sessions')
      .select('id, started_at')
      .gte('started_at', cohortStart)
      .lte('started_at', cohortEnd)
      .eq('status', 'completed');

    if (sessionsError) throw sessionsError;
    const sessionIds = sessions?.map((s: any) => s.id) || [];

    if (sessionIds.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No completed sessions in cohort window',
          scales_processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process each scale
    let inserted = 0;
    for (const [scaleCode, questionIds] of scaleMap.entries()) {
      // Get responses for this scale
      const { data: responses, error: respError } = await supabase
        .from('assessment_responses')
        .select('session_id, question_id, answer_numeric')
        .in('session_id', sessionIds)
        .in('question_id', questionIds)
        .not('answer_numeric', 'is', null);

      if (respError) {
        console.error(`[compute-reliability] Error fetching responses for ${scaleCode}:`, respError);
        continue;
      }

      // Build matrix: rows = sessions, cols = items
      const matrix = new Map<string, Map<number, number>>();
      responses?.forEach((r: any) => {
        if (!matrix.has(r.session_id)) matrix.set(r.session_id, new Map());
        matrix.get(r.session_id)!.set(r.question_id, r.answer_numeric);
      });

      // Filter to complete responses only
      const completeRows: number[][] = [];
      for (const [_, itemMap] of matrix.entries()) {
        if (itemMap.size === questionIds.length) {
          const row = questionIds.map(qid => itemMap.get(qid)!);
          completeRows.push(row);
        }
      }

      if (completeRows.length < 10) {
        console.log(`[compute-reliability] Skipping ${scaleCode}: only ${completeRows.length} complete responses`);
        continue;
      }

      // Compute Cronbach's Alpha
      const nItems = questionIds.length;
      const nRespondents = completeRows.length;

      // Item variances and total variance
      const itemVars: number[] = [];
      for (let j = 0; j < nItems; j++) {
        const col = completeRows.map(row => row[j]);
        const mean = col.reduce((a, b) => a + b, 0) / col.length;
        const variance = col.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / col.length;
        itemVars.push(variance);
      }

      const totalScores = completeRows.map(row => row.reduce((a, b) => a + b, 0));
      const totalMean = totalScores.reduce((a, b) => a + b, 0) / totalScores.length;
      const totalVar = totalScores.reduce((sum, val) => sum + Math.pow(val - totalMean, 2), 0) / totalScores.length;

      const sumItemVars = itemVars.reduce((a, b) => a + b, 0);
      const alpha = (nItems / (nItems - 1)) * (1 - sumItemVars / totalVar);

      // Insert into database
      const { error: insertError } = await supabase
        .from('psychometrics_external')
        .upsert({
          scale_code: scaleCode,
          results_version: resultsVersion,
          cohort_start: cohortStart,
          cohort_end: cohortEnd,
          n_respondents: nRespondents,
          cronbach_alpha: Math.round(alpha * 1000) / 1000,
          mcdonald_omega: null,
          sem: null,
          notes: 'Computed by edge function'
        }, {
          onConflict: 'scale_code,results_version,cohort_start,cohort_end'
        });

      if (insertError) {
        console.error(`[compute-reliability] Insert error for ${scaleCode}:`, insertError);
      } else {
        inserted++;
        console.log(`[compute-reliability] ${scaleCode}: α=${alpha.toFixed(3)}, n=${nRespondents}`);
      }
    }

    console.log(`[compute-reliability] Completed: ${inserted} scales processed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        scales_processed: inserted,
        cohort_start: cohortStart,
        cohort_end: cohortEnd,
        n_sessions: sessionIds.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[compute-reliability] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
