import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { 
    status, 
    headers: corsHeaders 
  });
}

async function assertOwner(service: any, sessionId: string, userId: string) {
  const { data, error } = await service.from("assessment_sessions").select("user_id").eq("id", sessionId).maybeSingle();
  if (error) throw new Error(`session_lookup_failed: ${error.message}`);
  if (!data) return jsonResponse({ ok: false, error: "session not found" }, 404);
  if (!data.user_id || data.user_id !== userId) return jsonResponse({ ok: false, error: "forbidden" }, 403);
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  try {
    const body = await req.json();
    const sessionId = body.session_id ?? body.sessionId;
    const shareToken = body.share_token ?? body.shareToken ?? null;
    
    console.log(JSON.stringify({
      evt: 'results_v2_start',
      session_id: sessionId,
      has_token: !!shareToken,
      timestamp: new Date().toISOString()
    }));
    
    if (!sessionId) return jsonResponse({ ok: false, error: "session_id required" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Handle authentication: share token OR owner
    let authContext: 'token' | 'owner' = 'token';
    
    if (!shareToken) {
      // No token → require owner authentication
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
      
      // Verify user owns this session
      const ownerCheck = await assertOwner(serviceClient, sessionId, user.id);
      if (ownerCheck) return ownerCheck; // 403/404 already returned
      
      authContext = 'owner';
    } else {
      // Validate share token
      const { data: sess } = await serviceClient
        .from("assessment_sessions")
        .select("share_token")
        .eq("id", sessionId)
        .maybeSingle();
      if (!sess || sess.share_token !== shareToken) {
        return jsonResponse({ ok: false, error: "invalid token" }, 401);
      }
    }

    // Try V2 (RPC), else v1 profile fallback
    try {
      const { data, error } = await serviceClient.rpc('get_results_v2', {
        p_session_id: sessionId,
        p_share_token: shareToken || null
      });

      if (!error && data && data.length > 0) {
        const result = data[0];
        const { session, profile, types, functions, state } = result;

        // Check if we have complete v2 scoring data
        if (Array.isArray(types) && types.length === 16 && 
            Array.isArray(functions) && functions.length === 8 && 
            Array.isArray(state) && state.length > 0) {
          
          console.log(JSON.stringify({
            evt: 'results_v2_complete',
            session_id: sessionId,
            auth_context: authContext,
            types_count: types.length,
            functions_count: functions.length,
            state_count: state.length,
            timestamp: new Date().toISOString()
          }));

          return jsonResponse({ 
            ok: true, 
            results_version: "v2",
            session,
            profile,
            types,
            functions,
            state
          });
        }
      }
    } catch (rpcError: any) {
      console.log(JSON.stringify({
        evt: 'results_v2_rpc_error',
        session_id: sessionId,
        error: rpcError.message,
        timestamp: new Date().toISOString()
      }));
    }

    // Fallback to v1 profile
    const { data: profile, error: profErr } = await serviceClient
      .from("profiles")
      .select(`
        session_id, type_code, base_func, creative_func, top_types, top_3_fits, 
        score_fit_raw, score_fit_calibrated, fit_band, top_gap, close_call, 
        strengths, dimensions, blocks_norm, overlay, conf_raw, conf_calibrated, 
        confidence, results_version, created_at
      `)
      .eq("session_id", sessionId)
      .maybeSingle();

    if (profErr || !profile) {
      console.log(JSON.stringify({
        evt: 'results_fallback_missing',
        session_id: sessionId,
        error: profErr?.message,
        timestamp: new Date().toISOString()
      }));
      return jsonResponse({ ok: false, error: "no results found" }, 404);
    }

    console.log(JSON.stringify({
      evt: 'results_v1_fallback',
      session_id: sessionId,
      auth_context: authContext,
      timestamp: new Date().toISOString()
    }));

    return jsonResponse({ 
      ok: true, 
      results_version: profile.results_version ?? "v1.2.1", 
      session: { id: sessionId, created_at: profile.created_at }, 
      profile, 
      types: null, 
      functions: null, 
      state: null 
    });

  } catch (error: any) {
    console.error("Error in get-results-by-session:", error);
    return jsonResponse({ 
      ok: false, 
      error: error.message || "Internal server error" 
    }, 500);
  }
});