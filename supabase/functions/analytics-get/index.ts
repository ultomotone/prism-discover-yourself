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
    const block = url.searchParams.get("block") ?? "default";
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const anon = createClient(SUPABASE_URL, ANON_KEY);

    // Handle new KPI endpoints
    if (block === "component_kpis") {
      const [{ data: gates }, { data: fit }, { data: inv }] = await Promise.all([
        anon.from("mv_kpi_release_gates").select("*"),
        anon.from("cfa_fit").select("*").eq("results_version", ver),
        anon.from("mv_kpi_invariance").select("*").eq("results_version", ver)
      ]);
      return new Response(JSON.stringify({ gates: gates ?? [], fit: fit ?? [], invariance: inv?.[0] ?? null }), {
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    if (block === "scale_norms") {
      const { data, error } = await anon.from("mv_kpi_scale_norms").select("*");
      if (error) {
        console.error("[analytics-get] Norms error:", error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500, 
          headers: { ...corsHeaders, "content-type": "application/json" } 
        });
      }
      return new Response(JSON.stringify({ norms: data ?? [] }), {
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    if (block === "neuroticism") {
      const { data: n } = await anon.from("mv_kpi_neuroticism").select("*").limit(1);
      const { data: corrA } = await anon.from("mv_kpi_scale_corr").select("*").eq("scale_a", "N");
      const { data: corrB } = await anon.from("mv_kpi_scale_corr").select("*").eq("scale_b", "N");
      const corr = [
        ...(corrA ?? []).map((r: any) => ({ other: r.scale_b, r: r.r, n_pairs: r.n_pairs })),
        ...(corrB ?? []).map((r: any) => ({ other: r.scale_a, r: r.r, n_pairs: r.n_pairs }))
      ].sort((a, b) => Math.abs(b.r) - Math.abs(a.r)).slice(0, 5);
      return new Response(JSON.stringify({ neuroticism: n?.[0] ?? null, top_corr: corr }), {
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    if (block === "state_overlay") {
      const periodParam = url.searchParams.get("period") ?? "all";
      
      // Lifetime aggregate (single row)
      if (periodParam === "all") {
        const { data, error } = await anon.from("mv_kpi_state_overlay").select("*").limit(1).maybeSingle();
        if (error) {
          console.error("[analytics-get] State overlay error:", error);
          return new Response(JSON.stringify({ error: error.message }), { 
            status: 500, 
            headers: { ...corsHeaders, "content-type": "application/json" } 
          });
        }
        return new Response(JSON.stringify({ state_overlay: data ?? null }), {
          headers: { ...corsHeaders, "content-type": "application/json" }
        });
      }

      // Time-windowed via daily MV
      const dayMap: Record<string, number> = { "7d": 7, "30d": 30, "60d": 60, "90d": 90, "365d": 365 };
      const days = dayMap[periodParam] ?? 30;
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const { data, error } = await anon
        .from("mv_state_overlay_daily")
        .select("*")
        .gte("day", cutoffDate)
        .order("day", { ascending: true });

      if (error) {
        console.error("[analytics-get] State overlay daily error:", error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500, 
          headers: { ...corsHeaders, "content-type": "application/json" } 
        });
      }

      if (!data || data.length === 0) {
        return new Response(JSON.stringify({ state_overlay: null, series: [] }), {
          headers: { ...corsHeaders, "content-type": "application/json" }
        });
      }

      // Aggregate windowed data
      const mean = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
      const kpi = {
        pct_n_plus: mean(data.map(d => Number(d.pct_n_plus) || 0))?.toFixed(2) || "0",
        pct_n0: mean(data.map(d => Number(d.pct_n0) || 0))?.toFixed(2) || "0",
        pct_n_minus: mean(data.map(d => Number(d.pct_n_minus) || 0))?.toFixed(2) || "0",
        mean_stress: mean(data.map(d => Number(d.mean_stress) || 0))?.toFixed(2) || "0",
        mean_mood: mean(data.map(d => Number(d.mean_mood) || 0))?.toFixed(2) || "0",
        mean_sleep: mean(data.map(d => Number(d.mean_sleep) || 0))?.toFixed(2) || "0",
        mean_focus: mean(data.map(d => Number(d.mean_focus) || 0))?.toFixed(2) || "0",
        mean_time: mean(data.map(d => Number(d.mean_time) || 0))?.toFixed(2) || "0",
        r_state_traitn: mean(data.map(d => Number(d.r_state_traitn) || 0))?.toFixed(3) || "0",
        conf_mean_nplus: mean(data.map(d => Number(d.conf_mean_nplus) || 0))?.toFixed(3) || "0",
        conf_mean_n0: mean(data.map(d => Number(d.conf_mean_n0) || 0))?.toFixed(3) || "0",
        conf_mean_nminus: mean(data.map(d => Number(d.conf_mean_nminus) || 0))?.toFixed(3) || "0",
        topgap_mean_nplus: mean(data.map(d => Number(d.topgap_mean_nplus) || 0))?.toFixed(3) || "0",
        topgap_mean_n0: mean(data.map(d => Number(d.topgap_mean_n0) || 0))?.toFixed(3) || "0",
        topgap_mean_nminus: mean(data.map(d => Number(d.topgap_mean_nminus) || 0))?.toFixed(3) || "0",
      };

      return new Response(JSON.stringify({ state_overlay: kpi, series: data }), {
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

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

    // Split-Half Reliability (SB)
    const { data: splitHalf, error: e9 } = await sb.rpc("exec_sql", {
      q: `SELECT scale_code, split_half_sb, split_half_n FROM psychometrics_external WHERE results_version='${ver}' AND split_half_sb IS NOT NULL ORDER BY scale_code`
    } as any);
    if (e9) {
      console.error("[analytics-get] Split-half error:", e9);
    }

    // Item Discrimination
    const { data: itemDiscrimination, error: e10 } = await sb.rpc("exec_sql", {
      q: `SELECT scale_code, question_id, r_it, n_used FROM psychometrics_item_stats WHERE results_version='${ver}' ORDER BY scale_code, question_id`
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

    // Measurement Invariance
    const { data: measurementInvariance, error: e11b } = await sb.rpc("exec_sql", {
      q: `SELECT model_name, delta_cfi, model_comparison, n FROM measurement_invariance WHERE results_version='${ver}' ORDER BY created_at DESC LIMIT 1`
    } as any);
    if (e11b) {
      console.error("[analytics-get] Measurement invariance error:", e11b);
    }

    // Item Flags (clarity/confusion reports) - aggregated
    const { data: itemFlags, error: e14 } = await sb.rpc("exec_sql", {
      q: `
        SELECT 
          f.question_id,
          q.section,
          COUNT(*) as flags,
          COALESCE(
            (SELECT COUNT(DISTINCT session_id) 
             FROM assessment_responses r 
             WHERE r.question_id = f.question_id),
            1
          ) as answered,
          (COUNT(*)::float / GREATEST(
            (SELECT COUNT(DISTINCT session_id) 
             FROM assessment_responses r 
             WHERE r.question_id = f.question_id),
            1
          ))::numeric as flag_rate
        FROM assessment_item_flags f
        LEFT JOIN assessment_questions q ON q.id = f.question_id
        GROUP BY f.question_id, q.section
        ORDER BY flag_rate DESC NULLS LAST
        LIMIT 50
      `
    } as any);
    if (e14) {
      console.error("[analytics-get] Item flags error:", e14);
    }

    // Item Flag Details (individual notes for drill-in)
    const { data: itemFlagDetails, error: e15_details } = await sb.rpc("exec_sql", {
      q: `
        SELECT 
          f.question_id,
          f.session_id,
          f.note,
          f.flag_type,
          f.created_at
        FROM assessment_item_flags f
        WHERE f.note IS NOT NULL AND f.note != ''
        ORDER BY f.created_at DESC
        LIMIT 500
      `
    } as any);
    if (e15_details) {
      console.error("[analytics-get] Item flag details error:", e15_details);
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
    const { count, error: e16 } = await sb.from('profiles')
      .select('session_id', { count: 'exact' });
    
    if (e16) {
      console.error("[analytics-get] Business metrics error:", e16);
    }
    
    const businessMetrics = [{
      total_completions: count ?? 0,
      unique_users: 0 // placeholder until user tracking implemented
    }];

    console.log(`[analytics-get] Success: engagement=${engagement?.length ?? 0} rows, reliability=${reliability?.length ?? 0} scales, live=${liveToday?.[0] ? 'yes' : 'no'}, itemFlags=${itemFlags?.length ?? 0}, flagDetails=${itemFlagDetails?.length ?? 0}`);

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
        measurementInvariance: measurementInvariance?.[0] ?? { delta_cfi: null, model_comparison: null, n: 0 },
        itemFlags: itemFlags ?? [],
        itemFlagDetails: itemFlagDetails ?? [],
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
