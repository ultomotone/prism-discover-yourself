import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkRequest {
  session_id: string;
  user_id: string;
  email?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, user_id, email } = await req.json() as LinkRequest;
    if (!session_id || !user_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'missing_params' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Use the new RPC function with conflict handling
    const { data, error } = await supabase.rpc('link_session_to_user', {
      p_session: session_id,
      p_user: user_id,
      p_email: email || null
    });

    if (error) {
      console.error('RPC link_session_to_user error:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Map RPC response to HTTP status codes
    switch (data.status) {
      case 'linked':
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      case 'conflict':
        return new Response(
          JSON.stringify({ success: false, code: 'ALREADY_LINKED', error: 'Session already linked to different user' }),
          { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      case 'not_found':
        return new Response(
          JSON.stringify({ success: false, error: 'Session not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Unexpected response' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
    }

  } catch (e) {
    console.error('Error in link_session_to_account:', e);
    return new Response(
      JSON.stringify({ success: false, error: e.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

