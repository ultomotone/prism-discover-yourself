import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(url, key);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

      // Fire-and-forget admin notify
      try {
        supabase.functions.invoke('notify_admin', {
          body: {
            type: 'assessment_completed',
            session_id,
            share_token: sessionData?.share_token || null
          }
        });
      } catch (e) {
        console.error('notify_admin failed (existingProfile):', e);
      }

      return new Response(
        JSON.stringify({
          ok: true,
          status: 'success',
          session_id,
          share_token: sessionData?.share_token,
          profile: existingProfile,
          results_url: `${req.headers.get('origin') || 'https://prismassessment.com'}/results/${session_id}?t=${sessionData?.share_token}`
        }),
        {
          status: 200,
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

    // First compute FC scores (if any)
    try {
      await supabase.functions.invoke('score_fc_session', { body: { session_id } });
    } catch (e) {
      console.error('score_fc_session failed:', e);
    }

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

    // Handle different scoring result shapes - be tolerant to maintenance mode and various formats
    const isValidResult = (scoringResult?.status === 'success') || (scoringResult?.ok === true);
    const hasProfile = scoringResult?.profile;
    
    // Handle maintenance mode gracefully
    if (scoringResult?.status === 'maintenance') {
      console.error('PRISM scoring is in maintenance mode:', scoringResult.message)
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: `Assessment system is temporarily unavailable: ${scoringResult.message || 'Maintenance mode'}` 
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    if (!isValidResult || !hasProfile) {
      console.error('Invalid scoring result shape:', JSON.stringify(scoringResult, null, 2))
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: `Invalid scoring result: ${scoringResult?.error || scoringResult?.message || 'Unknown error'}` 
        }),
        { 
          status: 422, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update session as completed with share token
    const shareToken = sessionData.share_token || crypto.randomUUID()

    // Persist profile to profiles table
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(scoringResult.profile, { onConflict: 'session_id', ignoreDuplicates: false });
    if (upsertError) {
      console.error('Profile upsert error:', upsertError);
      return new Response(
        JSON.stringify({ ok: false, error: `Failed to save profile: ${upsertError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

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

    const resultsUrl = `${req.headers.get('origin') || 'https://prismassessment.com'}/results/${session_id}?t=${shareToken}`

    // Fire-and-forget admin notify
    try {
      supabase.functions.invoke('notify_admin', {
        body: {
          type: 'assessment_completed',
          session_id,
          share_token: shareToken
        }
      });
    } catch (e) {
      console.error('notify_admin failed:', e);
    }

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
        status: 200,
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