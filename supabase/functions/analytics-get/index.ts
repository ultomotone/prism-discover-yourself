import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
        ORDER BY scale_id
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
      q: `SELECT * FROM mv_kpi_construct_coverage ORDER BY scale_code`
    } as any);
    if (e4) {
      console.error("[analytics-get] Coverage error:", e4);
      throw e4;
    }

    console.log(`[analytics-get] Success: engagement=${engagement?.length ?? 0} rows, reliability=${reliability?.length ?? 0} scales`);

    return new Response(
      JSON.stringify({ 
        engagement: engagement ?? [], 
        reliability: reliability ?? [], 
        retest: retest ?? [], 
        coverage: coverage ?? [] 
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
