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

    // Try RPC with correct parameter names
    const { data, error } = await supabase.rpc("get_profile_by_session", {
      p_session_id: session_id,
      p_share_token: share_token,
    });
    
    if (error) {
      console.log(`rpc_error:${error.message},session:${session_id}`);
      // Fallback: direct query with token validation
      const { data: sessionData, error: sessionError } = await supabase
        .from("assessment_sessions")
        .select("id, share_token, share_token_expires_at, status")
        .eq("id", session_id)
        .maybeSingle();

      if (sessionError || !sessionData) {
        return new Response(JSON.stringify({ status: "error", error: "session not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (sessionData.share_token !== share_token) {
        return new Response(JSON.stringify({ status: "error", error: "invalid token" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check token expiration
      if (sessionData.share_token_expires_at && new Date(sessionData.share_token_expires_at) < new Date()) {
        return new Response(JSON.stringify({ status: "error", error: "token expired" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("session_id", session_id)
        .maybeSingle();

      if (profileError) {
        return new Response(JSON.stringify({ status: "error", error: profileError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!profileData) {
        return new Response(JSON.stringify({ status: "error", error: "profile not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const profile = { ...profileData };
      delete (profile as any).share_token;
      
      return new Response(
        JSON.stringify({ status: "success", profile, session: sessionData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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
    console.log(`general_error:${e.message}`);
    return new Response(JSON.stringify({ status: "error", error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});