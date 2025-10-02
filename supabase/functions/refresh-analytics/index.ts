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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log("[refresh-analytics] Starting materialized views refresh");

    const { data, error } = await sb.rpc('refresh_all_materialized_views');

    if (error) {
      console.error("[refresh-analytics] Error:", error);
      throw error;
    }

    console.log("[refresh-analytics] Success:", data);

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, "content-type": "application/json" },
        status: 200
      }
    );
  } catch (err) {
    console.error("[refresh-analytics] Fatal error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        headers: { ...corsHeaders, "content-type": "application/json" },
        status: 500
      }
    );
  }
});
