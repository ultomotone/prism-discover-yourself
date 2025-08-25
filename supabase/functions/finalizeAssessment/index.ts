import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ScoreInput = { session_id: string; responses: any[] };

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(url, key);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-store'
};

const json = (body: any, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 
      "Content-Type": "application/json", 
      ...corsHeaders
    },
  });

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { session_id, responses } = await req.json()
    
    if (!session_id) {
      return new Response(
        JSON.stringify({ ok: false, error: 'session_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('finalizeAssessment called for session:', session_id, 'responses:', responses?.length || 0)

    // Use the service role client defined at module level

    // Check if profile already exists for this session
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('session_id', session_id)
      .single()

    if (existingProfile) {
      console.log('Profile already exists for session:', session_id)
      // Update session status and return existing profile
      const { data: sessionData } = await supabase
        .from('assessment_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_questions: responses?.length || existingProfile.fc_answered_ct || 0
        })
        .eq('id', session_id)
        .select('share_token')
        .single()

      return new Response(
        JSON.stringify({ 
          ok: true, 
          status: 'success',
          session_id, 
          share_token: sessionData?.share_token,
          profile: existingProfile
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch session data
    const { data: sessionData, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !sessionData) {
      console.error('Session not found:', sessionError)
      return new Response(
        JSON.stringify({ ok: false, error: 'Session not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processing finalization for session:', session_id, 'using PRISM v1.2.0')

    // Invoke the score_prism function to compute results
    console.log('Invoking score_prism function')
    const { data: scoringResult, error: scoringError } = await supabase.functions.invoke('score_prism', {
      body: { session_id }
    })

    if (scoringError) {
      console.error('Scoring function error:', scoringError)
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: `Scoring failed: ${scoringError.message}` 
        }),
        { 
          status: 422, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!scoringResult || scoringResult.status !== 'success') {
      console.error('Invalid scoring result shape:', JSON.stringify(scoringResult, null, 2))
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: `Invalid scoring result: ${scoringResult?.error || 'Unknown error'}` 
        }),
        { 
          status: 422, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update session as completed with share token
    const shareToken = sessionData.share_token || crypto.randomUUID()
    
    const { error: sessionUpdateError } = await supabase
      .from('assessment_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_questions: responses?.length || scoringResult.profile?.fc_answered_ct || 0,
        share_token: shareToken
      })
      .eq('id', session_id)

    if (sessionUpdateError) {
      console.error('Session update error:', sessionUpdateError)
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: `Failed to update session: ${sessionUpdateError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Assessment finalized successfully for session:', session_id)

    const resultsUrl = `${req.headers.get('origin') || 'https://prismassessment.com'}/results/${session_id}?token=${shareToken}`

    return new Response(
      JSON.stringify({ 
        ok: true,
        status: 'success',
        session_id,
        share_token: shareToken,
        profile: scoringResult.profile,
        results_url: resultsUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in finalizeAssessment:', error)
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})