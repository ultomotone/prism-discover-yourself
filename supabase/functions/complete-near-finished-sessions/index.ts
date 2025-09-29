// supabase/functions/complete-near-finished-sessions/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Admin emails that can access this function
const ADMIN_EMAILS = [
  'daniel.joseph.speiss@gmail.com'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing environment variables" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Get the Authorization header from the request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with anon key to verify the user
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }), 
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { min_questions = 247, dry_run = false } = body;

    console.log(JSON.stringify({
      evt: "complete_near_finished_start",
      user_email: user.email,
      min_questions,
      dry_run
    }));

    // Create service role client
    const serviceSupabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Find sessions that are close to complete but not marked as completed
    const { data: nearComplete, error: queryError } = await serviceSupabase
      .from('assessment_sessions')
      .select('id, completed_questions, total_questions, status, started_at, email')
      .gte('completed_questions', min_questions)
      .lt('completed_questions', 248)
      .order('completed_questions', { ascending: false });

    if (queryError) {
      console.error(JSON.stringify({
        evt: "query_error",
        error: queryError.message
      }));
      return new Response(JSON.stringify({ error: queryError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(JSON.stringify({
      evt: "near_complete_sessions_found",
      count: nearComplete?.length || 0,
      sessions: nearComplete?.map(s => ({ id: s.id, questions: s.completed_questions }))
    }));

    let completed = 0;
    let recomputed = 0;
    const results = [];

    if (!dry_run) {
      // Complete the sessions
      for (const session of nearComplete || []) {
        try {
          // Mark as completed
          const { error: updateError } = await serviceSupabase
            .from('assessment_sessions')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              completed_questions: 248, // Set to 248 since they're close enough
              updated_at: new Date().toISOString()
            })
            .eq('id', session.id);

          if (updateError) {
            console.error(JSON.stringify({
              evt: "session_completion_error",
              session_id: session.id,
              error: updateError.message
            }));
            continue;
          }

          completed++;

          // Trigger recompute
          const recomputeResponse = await fetch(`${SUPABASE_URL}/functions/v1/recompute-session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ session_id: session.id, dry_run: false })
          });

          if (recomputeResponse.ok) {
            recomputed++;
            console.log(JSON.stringify({
              evt: "session_completed_and_recomputed",
              session_id: session.id,
              original_questions: session.completed_questions
            }));
          } else {
            console.error(JSON.stringify({
              evt: "recompute_failed",
              session_id: session.id,
              status: recomputeResponse.status
            }));
          }

          results.push({
            session_id: session.id,
            original_questions: session.completed_questions,
            completed: true,
            recomputed: recomputeResponse.ok
          });

        } catch (error) {
          console.error(JSON.stringify({
            evt: "session_processing_error",
            session_id: session.id,
            error: error instanceof Error ? error.message : String(error)
          }));
        }
      }
    }

    const result = {
      found: nearComplete?.length || 0,
      completed,
      recomputed,
      dry_run,
      results: dry_run ? nearComplete : results
    };

    console.log(JSON.stringify({
      evt: "complete_near_finished_complete",
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
      evt: "complete_near_finished_error",
      error: errorMessage,
      stack: errorStack
    }));
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      code: "COMPLETE_NEAR_FINISHED_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});