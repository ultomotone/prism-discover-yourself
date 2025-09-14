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
      return new Response(JSON.stringify({ status: "error", error: "session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!share_token) {
      console.log(`evt:tokenless_access,session_id:${session_id}`);
      return new Response(JSON.stringify({ status: "error", error: "share token required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, key);

    const { data, error } = await supabase.rpc("get_profile_by_session", {
      session_uuid: session_id,
      token_text: share_token,
    });
    if (error) {
      return new Response(JSON.stringify({ status: "error", error: error.message }), {
        status: Number(error.code) || 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!data?.profile) {
      return new Response(JSON.stringify({ status: "error", error: "not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const profile = data.profile;
    delete (profile as any).share_token;
    return new Response(
      JSON.stringify({ status: "success", profile, session: data.session }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ status: "error", error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

