import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PrismConfigManager } from '../_shared/config.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client and configuration manager
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const configManager = new PrismConfigManager(supabase);

    // Parse session_id from the request JSON body
    const { session_id } = await req.json();
    
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing finalization for session: ${session_id} using PRISM ${configManager.getVersion()}`);

    // Check if a profile already exists for the given session_id and return cached results if it does
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('session_id', session_id)
      .maybeSingle();

    if (existingProfile) {
      console.log('Profile already exists, returning cached result');
      const origin = req.headers.get('origin') || 'https://prism-discover-yourself.lovable.app';
      const resultsUrl = `${origin.replace(/\/$/, '')}/results/${session_id}`;

      const profileOut = {
        session_id,
        type_code: (existingProfile as any).type_code,
        results_version: (existingProfile as any).results_version ?? (existingProfile as any).version ?? 'v1.2.0',
        score_fit_calibrated: (existingProfile as any).score_fit_calibrated ?? null,
        top_types: (existingProfile as any).top_types ?? [],
        type_scores: (existingProfile as any).type_scores ?? {},
        ...(existingProfile as any)
      };

      return new Response(
        JSON.stringify({
          status: 'success',
          resultsUrl,
          profile: profileOut
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Retrieve assessment session data and update its status to 'completed'
    const { data: sessionData, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError) {
      console.error('Session retrieval error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Mark session as completed (best effort)
    await supabase
      .from('assessment_sessions')
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      })
      .eq('id', session_id);

    // Invoke the 'score_prism' Supabase function to generate assessment results
    console.log('Invoking score_prism function');
    const { data: scoringData, error: scoringError } = await supabase.functions.invoke('score_prism', {
      body: { session_id }
    });

    // Handle errors during scoring or if the scoring result is invalid
    if (scoringError) {
      console.error('Scoring error:', scoringError);
      return new Response(
        JSON.stringify({ 
          status: 'error',
          message: 'Scoring failed',
          details: scoringError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract the actual profile from the scoring response
    const profile = scoringData?.profile;
    if (!profile?.type_code) {
      console.error('Invalid scoring result shape:', scoringData);
      return new Response(
        JSON.stringify({ 
          status: 'error',
          message: 'Invalid scoring result shape',
          details: 'Missing profile or type_code'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Construct and return a results URL along with the profile data
    const origin = req.headers.get('origin') || 'https://prism-discover-yourself.lovable.app';
    const resultsUrl = `${origin.replace(/\/$/, '')}/results/${session_id}`;
    
    console.log('Assessment finalization completed successfully');
    
    const profileOut = {
      session_id,
      type_code: (profile as any).type_code,
      results_version: (profile as any).results_version ?? (profile as any).version ?? 'v1.2.0',
      score_fit_calibrated: (profile as any).score_fit_calibrated ?? null,
      top_types: (profile as any).top_types ?? [],
      type_scores: (profile as any).type_scores ?? {},
      ...(profile as any)
    };
    
    return new Response(
      JSON.stringify({ 
        status: 'success',
        resultsUrl,
        profile: profileOut
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    // Include error handling for unexpected issues during the process
    console.error('Unexpected error in finalizeAssessment:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})