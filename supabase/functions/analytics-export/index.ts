import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function toCSV(rows: any[]): string {
  if (!rows?.length) return "No data available\n";
  const cols = Object.keys(rows[0]);
  const header = cols.join(",");
  const lines = rows.map(r => 
    cols.map(c => {
      const val = r[c];
      if (val === null || val === undefined) return "";
      return JSON.stringify(String(val));
    }).join(",")
  );
  return [header, ...lines].join("\n");
}

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

    console.log(`[analytics-export] Exporting CSV for version=${ver}, period=${period}`);

    const periodFilter = period === "all" 
      ? "" 
      : ` AND day >= (current_date - interval '${Number(period)} days') `;

    // Fetch all data
    const { data: engagement } = await sb.rpc("exec_sql", { 
      q: `SELECT * FROM mv_kpi_engagement WHERE true ${periodFilter} ORDER BY day` 
    } as any);
    
    const { data: reliability } = await sb.rpc("exec_sql", { 
      q: `SELECT * FROM mv_kpi_reliability WHERE results_version='${ver}' ORDER BY scale_code` 
    } as any);
    
    const { data: retest } = await sb.rpc("exec_sql", { 
      q: `SELECT * FROM mv_kpi_retest WHERE results_version='${ver}' ORDER BY scale_code` 
    } as any);

    const { data: coverage } = await sb.rpc("exec_sql", {
      q: `SELECT scale_id, scale_code, scale_name, keyed_items, total_items, coverage_pct FROM mv_kpi_construct_coverage ORDER BY scale_code NULLS LAST, scale_id`
    } as any);

    const { data: fairness } = await sb.rpc("exec_sql", {
      q: `SELECT * FROM mv_kpi_fairness_dif`
    } as any);

    const { data: calibration } = await sb.rpc("exec_sql", {
      q: `SELECT results_version, ece, brier FROM mv_kpi_calibration WHERE results_version='${ver}'`
    } as any);

    const { data: calibrationBins } = await sb.rpc("exec_sql", {
      q: `SELECT bin_index, p_pred, p_obs, n FROM calibration_bins WHERE results_version='${ver}' ORDER BY bin_index`
    } as any);

    const { data: splitHalf } = await sb.rpc("exec_sql", {
      q: `SELECT scale_code, lambda2, n_respondents FROM split_half_results WHERE results_version='${ver}' ORDER BY scale_code`
    } as any);

    const { data: itemDiscrimination } = await sb.rpc("exec_sql", {
      q: `SELECT scale_code, question_id, r_it, n FROM item_discrimination WHERE results_version='${ver}' ORDER BY scale_code, question_id`
    } as any);

    const { data: cfaFit } = await sb.rpc("exec_sql", {
      q: `SELECT model_name, cfi, tli, rmsea, srmr, n FROM cfa_fit WHERE results_version='${ver}' ORDER BY model_name`
    } as any);

    // Build CSV bundle
    const bundle = [
      "# PRISM Analytics Export",
      `# Generated: ${new Date().toISOString()}`,
      `# Version: ${ver}, Period: ${period}`,
      "",
      "# ==========================================",
      "# Engagement Metrics (Period-based)",
      "# ==========================================",
      toCSV(engagement || []),
      "",
      "# ==========================================",
      "# Reliability Metrics (Cronbach α / McDonald ω)",
      "# ==========================================",
      toCSV(reliability || []),
      "",
      "# ==========================================",
      "# Test-Retest Reliability (Pearson r)",
      "# ==========================================",
      toCSV(retest || []),
      "",
      "# ==========================================",
      "# Construct Coverage (Item Bank)",
      "# ==========================================",
      toCSV(coverage || []),
      "",
      "# ==========================================",
      "# Fairness - DIF Analysis",
      "# ==========================================",
      toCSV(fairness || []),
      "",
      "# ==========================================",
      "# Calibration Summary (ECE & Brier)",
      "# ==========================================",
      toCSV(calibration || []),
      "",
      "# ==========================================",
      "# Calibration Bins (10 bins: p_pred vs p_obs)",
      "# ==========================================",
      toCSV(calibrationBins || []),
      "",
      "# ==========================================",
      "# Split-Half Reliability (Guttman λ₂)",
      "# ==========================================",
      toCSV(splitHalf || []),
      "",
      "# ==========================================",
      "# Item Discrimination (Corrected Item-Total r)",
      "# ==========================================",
      toCSV(itemDiscrimination || []),
      "",
      "# ==========================================",
      "# CFA Fit Indices",
      "# ==========================================",
      toCSV(cfaFit || []),
    ].join("\n");

    console.log(`[analytics-export] CSV generated, size=${bundle.length} bytes`);

    return new Response(bundle, {
      headers: {
        ...corsHeaders,
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="prism_analytics_${period}_${ver}_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (err) {
    console.error("[analytics-export] Error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }), 
      { 
        headers: { ...corsHeaders, "content-type": "application/json" },
        status: 500 
      }
    );
  }
});
