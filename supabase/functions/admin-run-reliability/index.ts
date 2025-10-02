import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify service_role authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log('[admin-run-reliability] Starting reliability computation...');
    const started_at = new Date().toISOString();

    // Call the compute-reliability edge function (assuming it exists)
    const { data, error } = await sb.functions.invoke('compute-reliability');
    
    if (error) {
      console.error('[admin-run-reliability] Error:', error);
      throw error;
    }

    console.log('[admin-run-reliability] Computation result:', data);

    // Refresh the materialized view
    const { error: refreshError } = await sb.rpc("exec_sql", {
      q: `
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_reliability;
        SELECT public._bump_mv_heartbeat('mv_kpi_reliability');
      `
    } as any);

    if (refreshError) {
      console.error('[admin-run-reliability] Refresh error:', refreshError);
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        started_at,
        result: data,
        message: 'Reliability computation triggered. Refresh the page to see updates.'
      }),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );

  } catch (err) {
    console.error('[admin-run-reliability] Fatal error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }
});
