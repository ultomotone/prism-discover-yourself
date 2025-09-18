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
    
    console.log(JSON.stringify({
      evt: 'results_v2_start',
      session_id,
      has_token: !!share_token,
      timestamp: new Date().toISOString()
    }));
    
    if (!session_id) {
      return jsonResponse({ ok: false, error: "session_id required" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Handle authentication
    let authContext: 'token' | 'owner' = 'token';
    
    if (!share_token) {
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
      
      authContext = 'owner';
    }

    // Call the v2 RPC function
    try {
      const { data, error } = await serviceClient.rpc('get_results_v2', {
        p_session_id: session_id,
        p_share_token: share_token || null
      });

      if (error) {
        console.error("RPC error:", error);
        if (error.message?.includes('session_not_found')) {
          return jsonResponse({ ok: false, error: "session not found" }, 404);
        }
        if (error.message?.includes('invalid_share_token')) {
          return jsonResponse({ ok: false, error: "invalid token" }, 401);
        }
        throw error;
      }

      if (!data || data.length === 0) {
        return jsonResponse({ ok: false, error: "no results found" }, 404);
      }

      const result = data[0];
      const { session, profile, types, functions, state } = result;

      // Check if we have v2 scoring data
      if (!types || types.length === 0) {
        console.log(JSON.stringify({
          evt: 'results_v2_missing_scoring',
          session_id,
          timestamp: new Date().toISOString()
        }));
        return jsonResponse({ 
          ok: false, 
          code: 'SCORING_ROWS_MISSING',
          error: "Scoring data not available" 
        }, 503);
      }

      console.log(JSON.stringify({
        evt: 'results_v2_complete',
        session_id,
        auth_context: authContext,
        types_count: types.length,
        functions_count: functions.length,
        state_count: state.length,
        timestamp: new Date().toISOString()
      }));

      // Return v2 contract
      return jsonResponse({ 
        ok: true, 
        session,
        profile,
        types,
        functions,
        state,
        results_version: 'v2'
      });

    } catch (rpcError: any) {
      console.log(JSON.stringify({
        evt: 'results_v2_error',
        session_id,
        error: rpcError.message,
        timestamp: new Date().toISOString()
      }));
      
      return jsonResponse({ 
        ok: false, 
        error: rpcError.message || "Internal server error" 
      }, 500);
    }

  } catch (error: any) {
    console.error("Error in get-results-by-session:", error);
    return jsonResponse({ 
      ok: false, 
      error: error.message || "Internal server error" 
    }, 500);
  }
});