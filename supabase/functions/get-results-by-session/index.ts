import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { 
    status, 
    headers: corsHeaders 
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  try {
    const { session_id, share_token } = await req.json();
    
    if (!session_id) {
      return jsonResponse({ ok: false, error: "session_id required" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    console.log(`Fetching results for session ${session_id}, token: ${share_token ? 'present' : 'missing'}`);

    // 1) If share token is present, validate against session row
    if (share_token) {
      const { data: session, error: sessionError } = await serviceClient
        .from("assessment_sessions")
        .select("id, share_token, share_token_expires_at, status")
        .eq("id", session_id)
        .single();

      if (sessionError || !session) {
        console.error("Session lookup error:", sessionError);
        return jsonResponse({ ok: false, error: "session not found" }, 404);
      }

      if (session.share_token !== share_token) {
        console.error("Invalid share token provided");
        return jsonResponse({ ok: false, error: "invalid token" }, 401);
      }

      // Check token expiration if set
      if (session.share_token_expires_at && new Date(session.share_token_expires_at) < new Date()) {
        console.error("Share token expired");
        return jsonResponse({ ok: false, error: "token expired" }, 401);
      }

      // Get profile for this session
      const { data: profile, error: profileError } = await serviceClient
        .from("profiles")
        .select("*")
        .eq("session_id", session_id)
        .single();

      if (profileError || !profile) {
        console.error("Profile lookup error:", profileError);
        return jsonResponse({ ok: false, error: "profile not found" }, 404);
      }

      console.log(`Profile found for session ${session_id} via share token`);
      return jsonResponse({ ok: true, profile, session });
    }

    // 2) No token → allow only if caller is the owner (Authorization header)
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return jsonResponse({ ok: false, error: "share token required" }, 401);
    }

    const jwt = authHeader.slice(7);
    const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false }
    });

    const { data: userResponse } = await authedClient.auth.getUser();
    const user = userResponse?.user;
    
    if (!user) {
      console.error("No authenticated user found");
      return jsonResponse({ ok: false, error: "unauthorized" }, 401);
    }

    // Check if user owns this session
    const { data: sessionData, error: sessionError } = await serviceClient
      .from("assessment_sessions")
      .select("id, user_id, status")
      .eq("id", session_id)
      .single();

    if (sessionError || !sessionData) {
      console.error("Session lookup error for owner:", sessionError);
      return jsonResponse({ ok: false, error: "session not found" }, 404);
    }

    if (sessionData.user_id !== user.id) {
      console.error(`Session ${session_id} belongs to ${sessionData.user_id}, not ${user.id}`);
      return jsonResponse({ ok: false, error: "forbidden" }, 403);
    }

    // Get profile for owned session
    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("*")
      .eq("session_id", session_id)
      .single();

    if (profileError || !profile) {
      console.error("Profile lookup error for owner:", profileError);
      return jsonResponse({ ok: false, error: "profile not found" }, 404);
    }

    console.log(`Profile found for session ${session_id} via owner auth`);
    return jsonResponse({ ok: true, profile, session: sessionData });

  } catch (error: any) {
    console.error("Error in get-results-by-session:", error);
    return jsonResponse({ 
      ok: false, 
      error: error.message || "Internal server error" 
    }, 500);
  }
});