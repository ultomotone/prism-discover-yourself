import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const ver = url.searchParams.get("ver") ?? "v1.2.1";
    const period = url.searchParams.get("period") ?? "all";
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log(`[analytics-get] Fetching data for version=${ver}, period=${period}`);

    const periodFilter = period === "all" 
      ? "" 
      : ` AND day >= (current_date - interval '${Number(period)} days') `;

    // Engagement metrics
    const { data: engagement, error: e1 } = await sb.rpc("exec_sql", {
      q: `
        SELECT * FROM mv_kpi_engagement
        WHERE true ${periodFilter}
        ORDER BY day DESC
      `
    } as any);
    if (e1) {
      console.error("[analytics-get] Engagement error:", e1);
      throw e1;
    }

    // Reliability metrics
    const { data: reliability, error: e2 } = await sb.rpc("exec_sql", {
      q: `
        SELECT * FROM mv_kpi_reliability
        WHERE results_version = '${ver}'
        ORDER BY scale_code
      `
    } as any);
    if (e2) {
      console.error("[analytics-get] Reliability error:", e2);
      throw e2;
    }

    // Retest metrics
    const { data: retest, error: e3 } = await sb.rpc("exec_sql", {
      q: `
        SELECT * FROM mv_kpi_retest 
        WHERE results_version='${ver}'
        ORDER BY scale_code
      `
    } as any);
    if (e3) {
      console.error("[analytics-get] Retest error:", e3);
      throw e3;
    }

    // Construct coverage
    const { data: coverage, error: e4 } = await sb.rpc("exec_sql", {
      q: `SELECT scale_id, scale_code, scale_name, keyed_items, total_items, coverage_pct FROM mv_kpi_construct_coverage ORDER BY scale_id`
    } as any);
    if (e4) {
      console.error("[analytics-get] Coverage error:", e4);
      throw e4;
    }

    // Fairness metrics (DIF)
    const { data: fairness, error: e6 } = await sb.rpc("exec_sql", {
      q: `SELECT * FROM mv_kpi_fairness_dif LIMIT 1`
    } as any);
    if (e6) {
      console.error("[analytics-get] Fairness error:", e6);
    }

    // Calibration metrics
    const { data: calibration, error: e7 } = await sb.rpc("exec_sql", {
      q: `SELECT results_version, ece, brier, bins FROM mv_kpi_calibration WHERE results_version='${ver}' LIMIT 1`
    } as any);
    if (e7) {
      console.error("[analytics-get] Calibration error:", e7);
    }

    // Classification stability
    const { data: classificationStability, error: e8 } = await sb.rpc("exec_sql", {
      q: `SELECT * FROM mv_kpi_classification_stability LIMIT 1`
    } as any);
    if (e8) {
      console.error("[analytics-get] Classification stability error:", e8);
    }

    // Split-Half Reliability (λ₂)
    const { data: splitHalf, error: e9 } = await sb.rpc("exec_sql", {
      q: `SELECT scale_code, lambda2, n_respondents FROM split_half_results WHERE results_version='${ver}' ORDER BY scale_code`
    } as any);
    if (e9) {
      console.error("[analytics-get] Split-half error:", e9);
    }

    // Item Discrimination
    const { data: itemDiscrimination, error: e10 } = await sb.rpc("exec_sql", {
      q: `SELECT scale_code, question_id, r_it, n FROM item_discrimination WHERE results_version='${ver}' ORDER BY scale_code`
    } as any);
    if (e10) {
      console.error("[analytics-get] Item discrimination error:", e10);
    }

    // CFA Fit Indices
    const { data: cfaFit, error: e11 } = await sb.rpc("exec_sql", {
      q: `SELECT model_name, cfi, tli, rmsea, srmr, n FROM cfa_fit WHERE results_version='${ver}' ORDER BY model_name`
    } as any);
    if (e11) {
      console.error("[analytics-get] CFA fit error:", e11);
    }

    // Live today metrics (always fresh, <1s query)
    const { data: liveToday, error: e12 } = await sb.rpc("exec_sql", {
      q: `SELECT * FROM v_kpi_live_today`
    } as any);
    if (e12) {
      console.error("[analytics-get] Live today error:", e12);
    }

    // MV refresh ages (for live badge)
    const { data: mvAges, error: e13 } = await sb.rpc("exec_sql", {
      q: `SELECT view_name, refreshed_at FROM mv_refresh_log ORDER BY view_name`
    } as any);
    if (e13) {
      console.error("[analytics-get] MV ages error:", e13);
    }

    // Business metrics  
    const { count, error: e14 } = await sb.from('profiles')
      .select('session_id', { count: 'exact' });
    
    if (e14) {
      console.error("[analytics-get] Business metrics error:", e14);
    }
    
    const businessMetrics = [{
      total_completions: count ?? 0,
      unique_users: 0 // placeholder until user tracking implemented
    }];

    console.log(`[analytics-get] Success: engagement=${engagement?.length ?? 0} rows, reliability=${reliability?.length ?? 0} scales, live=${liveToday?.[0] ? 'yes' : 'no'}`);

    return new Response(
      JSON.stringify({ 
        engagement: engagement ?? [], 
        live: liveToday?.[0] ?? { sessions_started: 0, sessions_completed: 0, completion_rate_pct: 0, drop_off_rate_pct: 0, median_completion_sec: null },
        mv_ages: mvAges ?? [],
        reliability: reliability ?? [], 
        retest: retest ?? [], 
        coverage: coverage ?? [],
        fairness: fairness?.[0] ?? { flagged_items: 0, total_items: 0, dif_flag_rate_pct: null },
        calibration: calibration?.[0] ?? { results_version: ver, ece: null, brier: null, bins: null },
        classificationStability: classificationStability?.[0] ?? { n_pairs: 0, stability_rate: null },
        splitHalf: splitHalf ?? [],
        itemDiscrimination: itemDiscrimination ?? [],
        cfaFit: cfaFit ?? [],
        business: businessMetrics?.[0] ?? { total_completions: 0, unique_users: 0 }
      }), 
      {
        headers: { ...corsHeaders, "content-type": "application/json" },
        status: 200
      }
    );
  } catch (err) {
    console.error("[analytics-get] Fatal error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }), 
      { 
        headers: { ...corsHeaders, "content-type": "application/json" },
        status: 500 
      }
    );
  }
});
