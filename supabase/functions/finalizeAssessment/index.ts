import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(JSON.stringify({ 
        error: 'session_id is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`evt:finalize_start,session_id:${session_id}`);

    // Check if profile already exists for this session (idempotency)
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('session_id', session_id)
      .single();

    if (existingProfile && !profileError) {
      console.log(`evt:profile_exists,session_id:${session_id},returning_existing`);
      
      // Generate results URL
      const { data: sessionData } = await supabase
        .from('assessment_sessions')
        .select('share_token')
        .eq('id', session_id)
        .single();

      const resultsUrl = sessionData?.share_token 
        ? `/results/${session_id}?token=${sessionData.share_token}&v=${existingProfile.results_version || 'v1.1'}`
        : `/results/${session_id}?v=${existingProfile.results_version || 'v1.1'}`;

      return new Response(JSON.stringify({
        status: 'success',
        profile: existingProfile,
        results_url: resultsUrl,
        cached: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if session exists and is valid
    const { data: sessionData, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !sessionData) {
      console.error(`evt:session_not_found,session_id:${session_id}`);
      return new Response(JSON.stringify({ 
        error: 'Session not found',
        session_id 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Mark session as completed if not already
    if (sessionData.status !== 'completed') {
      await supabase
        .from('assessment_sessions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', session_id);
    }

    // Call the scoring function to generate profile
    console.log(`evt:invoke_scoring,session_id:${session_id}`);
    const { data: scoreResult, error: scoreError } = await supabase.functions.invoke('score_prism', {
      body: { 
        session_id: session_id,
        debug: false 
      }
    });

    if (scoreError) {
      console.error(`evt:scoring_failed,session_id:${session_id},error:${scoreError.message}`);
      
      // Don't mark session as incomplete, keep it completed but return error with results_url
      const resultsUrl = sessionData.share_token 
        ? `/results/${session_id}?token=${sessionData.share_token}&v=error`
        : `/results/${session_id}?v=error`;

      return new Response(JSON.stringify({
        error: 'Scoring failed but responses are saved',
        session_id,
        results_url: resultsUrl,
        retry_available: true
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!scoreResult || scoreResult.status !== 'success') {
      console.error(`evt:scoring_invalid,session_id:${session_id},result:${JSON.stringify(scoreResult)}`);
      
      const resultsUrl = sessionData.share_token 
        ? `/results/${session_id}?token=${sessionData.share_token}&v=error`
        : `/results/${session_id}?v=error`;

      return new Response(JSON.stringify({
        error: 'Invalid scoring result but responses are saved',
        session_id,
        results_url: resultsUrl,
        retry_available: true
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const resultsUrl = sessionData.share_token 
      ? `/results/${session_id}?token=${sessionData.share_token}&v=${scoreResult.profile?.results_version || 'v1.1'}`
      : `/results/${session_id}?v=${scoreResult.profile?.results_version || 'v1.1'}`;

    console.log(`evt:finalize_success,session_id:${session_id}`);

    return new Response(JSON.stringify({
      status: 'success',
      profile: scoreResult.profile,
      results_url: resultsUrl,
      cached: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('evt:finalize_error', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      session_id: req.body?.session_id || 'unknown'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
