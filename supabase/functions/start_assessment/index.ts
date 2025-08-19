import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssessmentStartRequest {
  email?: string;
  user_id?: string;
  force_new?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, user_id, force_new = false }: AssessmentStartRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get IP and User-Agent for hashing
    const clientIP = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Create simple hashes (in production, use proper crypto)
    const encoder = new TextEncoder();
    const ipHash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(clientIP))))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    const uaHash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(userAgent))))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    // Check for existing in-progress session
    const { data: existingSession, error: sessionError } = await supabaseClient
      .from('assessment_sessions')
      .select('*')
      .eq('email', email)
      .eq('status', 'in_progress')
      .maybeSingle();

    if (sessionError) {
      console.error('Error checking existing session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing sessions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If existing session found and not forcing new
    if (existingSession && !force_new) {
      return new Response(
        JSON.stringify({ 
          session_id: existingSession.id,
          status: 'resumed',
          message: 'Existing session found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If forcing new, mark old session as abandoned
    if (existingSession && force_new) {
      await supabaseClient
        .from('assessment_sessions')
        .update({ status: 'abandoned' })
        .eq('id', existingSession.id);
    }

    // Check for recent completions (30-day threshold)
    const { data: recentCheck } = await supabaseClient
      .rpc('check_recent_completion', { user_email: email, threshold_days: 30 });

    const hasRecentCompletion = recentCheck?.[0]?.has_recent_completion || false;
    const daysSinceCompletion = recentCheck?.[0]?.days_since_completion || null;

    // Create new session
    const { data: newSession, error: createError } = await supabaseClient
      .from('assessment_sessions')
      .insert({
        email,
        user_id,
        status: 'in_progress',
        ip_hash: ipHash,
        ua_hash: uaHash,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating session:', createError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        session_id: newSession.id,
        status: 'new',
        has_recent_completion: hasRecentCompletion,
        days_since_completion: daysSinceCompletion,
        message: 'New session created'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in start_assessment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});