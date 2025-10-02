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
      q: `SELECT * FROM mv_kpi_reliability ORDER BY scale_id` 
    } as any);
    
    const { data: retest } = await sb.rpc("exec_sql", { 
      q: `SELECT * FROM mv_kpi_retest WHERE results_version='${ver}' ORDER BY scale_code` 
    } as any);

    // Build CSV bundle
    const bundle = [
      "# PRISM Analytics Export",
      `# Generated: ${new Date().toISOString()}`,
      `# Version: ${ver}, Period: ${period}`,
      "",
      "# ==========================================",
      "# Engagement Metrics",
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
