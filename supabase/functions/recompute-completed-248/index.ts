// supabase/functions/recompute-completed-248/index.ts
// Recomputes all completed sessions with 248+ questions and email addresses
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
    const { limit = 500, dry_run = false } = await req.json().catch(() => ({}));
    
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log(JSON.stringify({
      evt: "recompute_248_start",
      limit,
      dry_run
    }));

    // Find completed sessions with 248+ questions and emails
    const { data: sessions, error } = await supabase
      .from("assessment_sessions")
      .select("id, email, completed_questions, completed_at")
      .eq("status", "completed")
      .gte("completed_questions", 248)
      .not("email", "is", null)
      .neq("email", "")
      .order("completed_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error(JSON.stringify({
        evt: "recompute_248_query_error",
        error: error.message
      }));
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(JSON.stringify({
      evt: "found_sessions_248",
      count: sessions?.length || 0
    }));

    if (dry_run) {
      return new Response(JSON.stringify({
        ok: true,
        dry_run: true,
        sessions_found: sessions?.length || 0,
        preview: sessions?.slice(0, 5).map(s => ({
          session_id: s.id,
          email: s.email?.substring(0, 3) + "***", // Privacy
          completed_questions: s.completed_questions,
          completed_at: s.completed_at
        })) || []
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let ok = 0, fail = 0;
    const failed_sessions: string[] = [];
    const successful_sessions: string[] = [];

    // Process sessions with concurrency limit
    const BATCH_SIZE = 5;
    for (let i = 0; i < (sessions?.length || 0); i += BATCH_SIZE) {
      const batch = sessions!.slice(i, i + BATCH_SIZE);
      
      await Promise.allSettled(
        batch.map(async (session) => {
          try {
            await recomputeSession(supabase, session.id, false);
            ok++;
            successful_sessions.push(session.id);
            
            console.log(JSON.stringify({
              evt: "recompute_248_success",
              session_id: session.id,
              progress: `${ok + fail}/${sessions!.length}`
            }));
            
          } catch (error) {
            fail++;
            failed_sessions.push(session.id);
            console.error(JSON.stringify({
              evt: "recompute_248_error",
              session_id: session.id,
              error: error instanceof Error ? error.message : String(error)
            }));
          }
        })
      );

      // Progress logging every batch
      if (i % (BATCH_SIZE * 5) === 0) {
        console.log(JSON.stringify({
          evt: "recompute_248_progress",
          processed: ok + fail,
          total: sessions!.length,
          ok,
          fail
        }));
      }
    }

    const result = {
      scanned: sessions?.length || 0,
      ok,
      fail,
      failed_sessions: failed_sessions.slice(0, 10),
      successful_sessions: successful_sessions.slice(0, 10),
      dry_run: false
    };

    console.log(JSON.stringify({
      evt: "recompute_248_complete",
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
      evt: "recompute_248_error",
      error: errorMessage,
      stack: errorStack
    }));
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      code: "RECOMPUTE_248_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});