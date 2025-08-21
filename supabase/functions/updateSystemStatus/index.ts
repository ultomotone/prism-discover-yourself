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

    const { status, message } = await req.json();

    if (!status || !message) {
      return new Response(JSON.stringify({ 
        error: 'Status and message are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`evt:update_system_status,status:${status},message:${message}`);

    const newStatus = {
      status,
      message: message.trim(),
      last_updated: new Date().toISOString(),
      updated_by: 'admin'
    };

    // Update the system status in scoring_config
    const { error } = await supabase
      .from('scoring_config')
      .update({
        value: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'system_status');

    if (error) {
      console.error(`evt:update_system_status_failed,error:${error.message}`);
      throw error;
    }

    console.log(`evt:update_system_status_success`);

    return new Response(JSON.stringify({
      status: 'success',
      data: newStatus
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('evt:update_system_status_error', error);
    return new Response(JSON.stringify({ 
      error: (error as Error).message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});