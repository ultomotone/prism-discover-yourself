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
      .single();

    if (existingProfile) {
      console.log('Profile already exists, returning cached result');
      const resultsUrl = `https://de95f929-2a16-4b73-9441-1460cd22bde1.lovableproject.com/results/${session_id}`;
      return new Response(
        JSON.stringify({ 
          profile: existingProfile,
          resultsUrl 
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

    // Do not set session completed here; score_prism is the single writer of completion state

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
          error: 'Scoring failed',
          details: scoringError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!scoringData || scoringData.error) {
      console.error('Invalid scoring result:', scoringData);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid scoring result',
          details: scoringData?.error || 'No data returned from scoring'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Construct and return a results URL along with the profile data
    const resultsUrl = `https://de95f929-2a16-4b73-9441-1460cd22bde1.lovableproject.com/results/${session_id}`;
    
    console.log('Assessment finalization completed successfully');
    
    return new Response(
      JSON.stringify({ 
        profile: scoringData,
        resultsUrl,
        message: 'Assessment completed successfully'
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