import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { session_id, share_token } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) {
      return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(url, key);

    if (share_token) {
      const { data, error } = await supabase.rpc("get_profile_by_session", { session_id, share_token });
      if (error) {
        const status = Number(error.code) || 401;
        return new Response(JSON.stringify({ error: error.message }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (!data) {
        return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const profile = (data as any).profile ?? data;
      delete profile.share_token;
      return new Response(JSON.stringify({ profile, session: { id: session_id, status: "completed" } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // temporary fallback without token
    const { data } = await supabase.rpc("get_results_by_session", { session_id });
    if (data?.profile) {
      console.log(`evt:tokenless_access,session_id:${session_id}`);
      const profile = data.profile;
      delete profile.share_token;
      return new Response(JSON.stringify({ profile, session: data.session }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "share token required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("get-results-by-session error", e);
    return new Response(JSON.stringify({ error: e?.message || "internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
