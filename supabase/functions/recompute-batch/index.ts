// supabase/functions/recompute-batch/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      limit = 500, 
      session_ids = [], 
      since = null, 
      dry_run = false 
    } = await req.json().catch(() => ({}));
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log(JSON.stringify({
      evt: "recompute_batch_start",
      limit,
      session_ids_provided: session_ids.length,
      since,
      dry_run
    }));

    let candidates: { session_id: string }[] = [];
    
    if (session_ids.length) {
      candidates = session_ids.map((id: string) => ({ session_id: id }));
      console.log(JSON.stringify({
        evt: "using_provided_session_ids",
        count: candidates.length
      }));
    } else {
      // Use the view to find sessions that need recompute
      const base = supabase.from("v_sessions_for_recompute").select("session_id, session_created_at");
      const q = since ? base.gte("session_created_at", since) : base;
      const { data, error } = await q.limit(limit);
      
      if (error) {
        console.error(JSON.stringify({
          evt: "recompute_batch_query_error",
          error: error.message
        }));
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      candidates = data ?? [];
      console.log(JSON.stringify({
        evt: "found_sessions_for_recompute",
        count: candidates.length
      }));
    }

    let ok = 0, fail = 0;
    const failed_sessions: string[] = [];

    for (const row of candidates) {
      try {
        // Call recompute-session for each session
        const recomputeUrl = req.url.replace("recompute-batch", "recompute-session");
        const response = await fetch(recomputeUrl, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": req.headers.get("Authorization") || ""
          },
          body: JSON.stringify({ 
            session_id: row.session_id, 
            dry_run 
          })
        });
        
        if (response.ok) {
          ok++;
          if (ok % 10 === 0) {
            console.log(JSON.stringify({
              evt: "recompute_batch_progress",
              processed: ok + fail,
              total: candidates.length,
              ok,
              fail
            }));
          }
        } else {
          fail++;
          failed_sessions.push(row.session_id);
          console.warn(JSON.stringify({
            evt: "recompute_session_failed",
            session_id: row.session_id,
            status: response.status,
            error: await response.text().catch(() => "unknown")
          }));
        }
        } catch (error) {
          fail++;
          failed_sessions.push(row.session_id);
          console.error(JSON.stringify({
            evt: "recompute_session_error",
            session_id: row.session_id,
            error: error instanceof Error ? error.message : String(error)
          }));
      }
    }

    const result = {
      scanned: candidates.length,
      ok,
      fail,
      failed_sessions: failed_sessions.slice(0, 10), // Limit failed list
      dry_run
    };

    console.log(JSON.stringify({
      evt: "recompute_batch_complete",
      ...result
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(JSON.stringify({
      evt: "recompute_batch_error",
      error: errorMessage,
      stack: errorStack
    }));
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      code: "RECOMPUTE_BATCH_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});