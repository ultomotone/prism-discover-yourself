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
    console.log("[compute-cfa-loadings] Starting CFA computation");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const DATABASE_URL = Deno.env.get("DATABASE_URL")!;

    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL not configured");
    }

    // Execute Python CFA script
    console.log("[compute-cfa-loadings] Running Python CFA script");
    
    const process = new Deno.Command("python3", {
      args: ["/var/task/edge-jobs/psychometrics/compute_cfa_loadings.py"],
      env: { DATABASE_URL },
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await process.output();
    const output = new TextDecoder().decode(stdout);
    const errors = new TextDecoder().decode(stderr);

    console.log("[compute-cfa-loadings] Python output:", output);
    if (errors) console.error("[compute-cfa-loadings] Python errors:", errors);

    if (code !== 0) {
      throw new Error(`Python script failed with code ${code}: ${errors}`);
    }

    // Refresh materialized views
    console.log("[compute-cfa-loadings] Refreshing materialized views");
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    const { error: refreshError } = await sb.rpc('refresh_psych_kpis');
    if (refreshError) {
      console.error("[compute-cfa-loadings] Refresh error:", refreshError);
      throw refreshError;
    }

    console.log("[compute-cfa-loadings] ✅ Complete");

    return new Response(
      JSON.stringify({
        success: true,
        message: "CFA loadings computed and MVs refreshed",
        output: output
      }),
      { headers: { ...corsHeaders, "content-type": "application/json" } }
    );

  } catch (err) {
    console.error("[compute-cfa-loadings] Error:", err);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: String(err),
        message: "CFA computation failed"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );
  }
});
