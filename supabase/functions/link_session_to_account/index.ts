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

    const { error } = await supabase
      .from('assessment_sessions')
      .update({
        user_id,
        email: email ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session_id)
      .is('user_id', null);

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: e.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

