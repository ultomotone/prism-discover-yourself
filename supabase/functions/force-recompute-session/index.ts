// supabase/functions/force-recompute-session/index.ts
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

  try {
    const { session_id, force_recompute = false } = await req.json().catch(() => ({}));
    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    console.log(`Force recomputing session: ${session_id}`);
    
    // Force clear the cache by updating scoring_results computed_at
    if (force_recompute) {
      await supabase
        .from('scoring_results')
        .update({ computed_at: new Date('2000-01-01') })
        .eq('session_id', session_id);
    }
    
    // Use the shared helper function to recompute
    const result = await recomputeSession(supabase, session_id, false);

    console.log(JSON.stringify({
      evt: "force_recompute_complete",
      session_id,
      version: result.version,
      type_code: result.type_code,
      confidence: result.confidence
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(JSON.stringify({
      evt: "force_recompute_error",
      error: errorMessage
    }));
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      code: "FORCE_RECOMPUTE_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});