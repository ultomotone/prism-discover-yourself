// @ts-nocheck

import { createClient } from "../_shared/supabaseClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const body = await req.json().catch(() => ({}));
    const sessionIds: string[] = body.session_ids || (body.session_id ? [body.session_id] : []);

    if (!sessionIds.length) {
      return new Response(JSON.stringify({ error: 'Provide session_id or session_ids[]' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Dry run support - check how many would be deleted
    if (body.dry_run) {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).in('session_id', sessionIds).eq('type_code', 'UNK');
      return new Response(JSON.stringify({ success: true, dry_run: true, would_delete: count || 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    // Delete only UNK profiles for safety
    const { error: delError, count } = await supabase
      .from('profiles')
      .delete({ count: 'exact' })
      .in('session_id', sessionIds)
      .eq('type_code', 'UNK');

    if (delError) {
      console.error('cleanup_profiles delete error:', delError);
      return new Response(JSON.stringify({ success: false, error: delError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, deleted: count || 0, sessions: sessionIds.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('cleanup_profiles error:', e);
    return new Response(JSON.stringify({ success: false, error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
