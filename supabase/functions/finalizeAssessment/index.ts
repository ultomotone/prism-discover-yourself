import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildResultsLink } from "../_shared/results-link.ts";

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
    const { session_id, responses } = await req.json();

    if (!session_id) {
      return json({ ok: false, error: 'session_id is required' }, 400);
    }

    console.log('finalizeAssessment called for session:', session_id, 'responses:', responses?.length || 0);

    const siteUrl =
      Deno.env.get('RESULTS_BASE_URL') ||
      req.headers.get('origin') ||
      'https://prismassessment.com';

    // Check if profile already exists for this session
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('session_id', session_id)
      .single();

    if (existingProfile) {
      console.log('Profile already exists for session:', session_id);

      const shareToken = existingProfile.share_token || crypto.randomUUID();

      const { data: sessionData } = await supabase
        .from('assessment_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          finalized_at: new Date().toISOString(),
          completed_questions: responses ? new Set(responses.map((r:any)=>r.question_id)).size : existingProfile.fc_answered_ct || 0,
          share_token: shareToken,
          profile_id: existingProfile.id
        })
        .eq('id', session_id)
        .select('share_token')
        .single();

      await supabase
        .from('profiles')
        .update({ share_token: shareToken })
        .eq('id', existingProfile.id);

      try {
        supabase.functions.invoke('notify_admin', {
          body: {
            type: 'assessment_completed',
            session_id,
            share_token: shareToken
          }
        });
      } catch (e) {
        console.error('notify_admin failed (existingProfile):', e);
      }

      return json({
        ok: true,
        status: 'success',
        session_id,
        share_token: shareToken,
        profile: { ...existingProfile, share_token: shareToken },
        results_url: buildResultsLink(siteUrl, session_id, shareToken)
      }, 200);
    }

    // Fetch session data
    const { data: sessionData, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !sessionData) {
      console.error('Session not found:', sessionError);
      return json({ ok: false, error: 'Session not found' }, 404);
    }

    console.log('Processing finalization for session:', session_id, 'using PRISM v1.2.1');

    // First compute FC scores (if any)
    try {
      await supabase.functions.invoke('score_fc_session', { body: { session_id } });
    } catch (e) {
      console.error('score_fc_session failed:', e);
    }

    // Fetch normalized FC scores
    let fc_scores: Record<string, number> | undefined = undefined;
    try {
      const { data: fcRow } = await supabase
        .from('fc_scores')
        .select('scores_json')
        .eq('session_id', session_id)
        .eq('version', 'v1.1')
        .eq('fc_kind', 'functions')
        .maybeSingle();
      if (fcRow?.scores_json) fc_scores = fcRow.scores_json as Record<string, number>;
    } catch (e) {
      console.error('fc_scores fetch failed:', e);
    }

    // Invoke the score_prism function to compute results
    console.log('Invoking score_prism function');
    const { data: scoringResult, error: scoringError } = await supabase.functions.invoke('score_prism', {
      body: { session_id, fc_scores }
    });

    if (scoringError) {
      console.error('Scoring function error:', scoringError);
      return json({ ok: false, error: `Scoring failed: ${scoringError.message}` }, 422);
    }

    // Handle different scoring result shapes - be tolerant to maintenance mode and various formats
    const isValidResult = (scoringResult?.status === 'success') || (scoringResult?.ok === true);
    const hasProfile = scoringResult?.profile;

    // Handle maintenance mode gracefully
    if (scoringResult?.status === 'maintenance') {
      console.error('PRISM scoring is in maintenance mode:', scoringResult.message);
      return json({
        ok: false,
        error: `Assessment system is temporarily unavailable: ${scoringResult.message || 'Maintenance mode'}`
      }, 503);
    }

    if (!isValidResult || !hasProfile) {
      console.error('Invalid scoring result shape:', JSON.stringify(scoringResult, null, 2));
      return json({
        ok: false,
        error: `Invalid scoring result: ${scoringResult?.error || scoringResult?.message || 'Unknown error'}`
      }, 422);
    }

    // Update session as completed with share token
    const shareToken = sessionData.share_token || crypto.randomUUID();

    const profilePayload = { ...scoringResult.profile, share_token: shareToken };

    const { data: upsertedProfile, error: upsertError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'session_id', ignoreDuplicates: false })
      .select('id')
      .single();

    if (upsertError) {
      console.error('Profile upsert error:', upsertError);
      return json({ ok: false, error: `Failed to save profile: ${upsertError.message}` }, 500);
    }

    const { error: sessionUpdateError } = await supabase
      .from('assessment_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        finalized_at: new Date().toISOString(),
        completed_questions: responses ? new Set(responses.map((r:any)=>r.question_id)).size : scoringResult.profile?.fc_answered_ct || 0,
        share_token: shareToken,
        profile_id: upsertedProfile?.id || sessionData.profile_id
      })
      .eq('id', session_id);

    if (sessionUpdateError) {
      console.error('Session update error:', sessionUpdateError);
      return json({ ok: false, error: `Failed to update session: ${sessionUpdateError.message}` }, 500);
    }

    console.log(
      `evt:finalize_results,session_id:${session_id},` +
      `version:${scoringResult?.profile?.version},` +
      `input_hash:${scoringResult?.input_hash},` +
      `fc_present:${scoringResult?.fc_source === 'session'}`
    );

    console.log('Assessment finalized successfully for session:', session_id);

    const resultsUrl = buildResultsLink(siteUrl, session_id, shareToken);

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

    return json({
      ok: true,
      status: 'success',
      session_id,
      share_token: shareToken,
      profile: { ...scoringResult.profile, id: upsertedProfile?.id, share_token: shareToken },
      results_url: resultsUrl
    }, 200);

  } catch (error: any) {
    console.error('Error in finalizeAssessment:', error);
    return json({ ok: false, error: error?.message || 'Internal server error' }, 500);
  }
});
