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

    // Fairness metrics (placeholder until DIF implemented)
    const fairness = [{ flagged_items: 0, total_items: 0 }];

    // Calibration metrics
    const { data: calibration, error: e6 } = await sb.rpc("exec_sql", {
      q: `SELECT * FROM mv_kpi_calibration LIMIT 1`
    } as any);
    if (e6) {
      console.error("[analytics-get] Calibration error:", e6);
      throw e6;
    }

    // Classification stability
    const { data: classificationStability, error: e7 } = await sb.rpc("exec_sql", {
      q: `SELECT * FROM mv_kpi_classification_stability LIMIT 1`
    } as any);
    if (e7) {
      console.error("[analytics-get] Classification stability error:", e7);
      throw e7;
    }

    // Business metrics  
    const { count, error: e8 } = await sb.from('profiles')
      .select('session_id', { count: 'exact' });
    
    if (e8) {
      console.error("[analytics-get] Business metrics error:", e8);
    }
    
    const businessMetrics = [{
      total_completions: count ?? 0,
      unique_users: 0 // placeholder until user tracking implemented
    }];

    console.log(`[analytics-get] Success: engagement=${engagement?.length ?? 0} rows, reliability=${reliability?.length ?? 0} scales`);

    return new Response(
      JSON.stringify({ 
        engagement: engagement ?? [], 
        reliability: reliability ?? [], 
        retest: retest ?? [], 
        coverage: coverage ?? [],
        fairness: fairness?.[0] ?? { flagged_items: 0, total_items: 0 },
        calibration: calibration?.[0] ?? { avg_confidence: null, avg_top_gap: null, ece: null },
        classificationStability: classificationStability?.[0] ?? { n_pairs: 0, stability_rate: null },
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
