import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { recomputeSession } from "../_shared/recomputeSession.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(JSON.stringify({ 
        error: 'session_id is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Force scoring session: ${session_id}`);

    // Check if session exists and is completed
    const { data: session, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('id, status, completed_questions')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ 
        error: 'Session not found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get response count
    const { count: responseCount } = await supabase
      .from('assessment_responses')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session_id);

    console.log(`Session ${session_id}: status=${session.status}, responses=${responseCount}`);

    if ((responseCount ?? 0) < 50) {
      return new Response(JSON.stringify({ 
        error: `Insufficient responses (${responseCount ?? 0}) - need at least 50 for scoring` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Force recompute the session
    try {
      await recomputeSession(supabase, session_id, true);
      
      console.log(`Successfully scored session: ${session_id}`);
      
      return new Response(JSON.stringify({
        success: true,
        session_id: session_id,
        response_count: responseCount,
        message: 'Session scored successfully'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (scoringError: any) {
      console.error(`Scoring failed for session ${session_id}:`, scoringError);
      
      return new Response(JSON.stringify({
        error: 'Scoring failed',
        details: scoringError?.message || String(scoringError),
        session_id: session_id
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error: any) {
    console.error('Force score session error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error?.message || String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});