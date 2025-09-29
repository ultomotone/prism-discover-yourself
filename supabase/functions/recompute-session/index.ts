// supabase/functions/recompute-session/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { recomputeSession } from "../_shared/recomputeSession.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL or SERVICE_ROLE key" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Block browser calls - require service-role authorization
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.includes(SERVICE_ROLE_KEY.slice(0, 16))) {
    return new Response(
      JSON.stringify({ error: "Admin-only. Call from server with service-role key." }), 
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { session_id, dry_run = false } = await req.json().catch(() => ({}));
    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    // Use the shared helper function
    const result = await recomputeSession(supabase, session_id, dry_run);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(JSON.stringify({
      evt: "recompute_session_error",
      error: errorMessage,
      stack: errorStack
    }));
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      code: "RECOMPUTE_SESSION_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});