// @ts-nocheck
import { createServiceClient } from '../_shared/supabaseClient.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssessmentStartRequest {
  email?: string;
  user_id?: string;
  force_new?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createServiceClient();

    const body = await req.json() as AssessmentStartRequest;
    const { email, user_id, force_new } = body;

    console.log('Starting assessment session for:', { email, user_id, force_new });

    // Get client info
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const country = req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || 'unknown';

    // Generate hashed versions for privacy
    const encoder = new TextEncoder();
    const ipHash = await crypto.subtle.digest('SHA-256', encoder.encode(clientIP));
    const uaHash = await crypto.subtle.digest('SHA-256', encoder.encode(userAgent));

    const ipHashHex = Array.from(new Uint8Array(ipHash)).map(b => b.toString(16).padStart(2, '0')).join('');
    const uaHashHex = Array.from(new Uint8Array(uaHash)).map(b => b.toString(16).padStart(2, '0')).join('');

    // If email provided, check for existing sessions
    if (email && !force_new) {
      const { data: existingSession, error: existingError } = await supabase
        .from('assessment_sessions')
        .select('id, status, completed_questions, total_questions, created_at')
        .eq('email', email)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingSession) {
        console.log('Found existing session for email:', email);
        return new Response(JSON.stringify({
          success: true,
          session_id: existingSession.id,
          existing_session: true,
          progress: {
            completed: existingSession.completed_questions || 0,
            total: existingSession.total_questions || 0
          }
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // If force_new and email exists, mark old sessions as abandoned
    if (email && force_new) {
      await supabase
        .from('assessment_sessions')
        .update({ status: 'abandoned' })
        .eq('email', email)
        .eq('status', 'in_progress');
    }

    // Check for recent completion to avoid spam
    let recentCompletion = null;
    if (email) {
      const { data } = await supabase.rpc('check_recent_completion', {
        user_email: email,
        threshold_days: 30
      });
      
      if (data && data.length > 0) {
        recentCompletion = data[0];
      }
    }

    // Create new session
    const sessionId = crypto.randomUUID();
    const shareToken = crypto.randomUUID();

    const { data: newSession, error } = await supabase
      .from('assessment_sessions')
      .insert({
        id: sessionId,
        user_id: user_id || null,
        email: email || null,
        session_type: 'prism',
        share_token: shareToken,
        ip_hash: ipHashHex,
        ua_hash: uaHashHex,
        country_iso2: country,
        total_questions: 0, // Will be updated when assessment loads
        metadata: {
          client_ip: clientIP.substring(0, 10) + '...', // Partial IP for debugging
          user_agent: userAgent.substring(0, 50),
          country: country,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create assessment session',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Created new session:', sessionId);

    return new Response(JSON.stringify({
      success: true,
      session_id: sessionId,
      share_token: shareToken,
      existing_session: false,
      recent_completion: recentCompletion
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in start_assessment:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});