// @ts-nocheck
import { createClient } from "../_shared/supabaseClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // System status gate
  const { data: statusData } = await supabase.from('scoring_config').select('value').eq('key', 'system_status').maybeSingle();
  const sys = statusData?.value || { status: "ok" };
  if (sys.status && String(sys.status).toLowerCase() !== "ok") {
    return new Response(JSON.stringify({
      status: "maintenance",
      message: sys.message || "Backfill paused during maintenance. Please try again soon."
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});
  }

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = !!body.dry_run;

    // 1) Find completed sessions in last 90 days with no profile
    const { data: completedSessions, error: sessErr } = await supabase
      .from('assessment_sessions')
      .select('id')
      .eq('status', 'completed')
      .gte('started_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    if (sessErr) {
      console.error('backfill: sessions error', sessErr);
      return new Response(JSON.stringify({ success: false, error: sessErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const sessionIds = (completedSessions || []).map(s => s.id);

    // Load profiles for these sessions
    const { data: existingProfiles, error: profErr } = await supabase
      .from('profiles')
      .select('session_id')
      .in('session_id', sessionIds);

    if (profErr) {
      console.error('backfill: profiles error', profErr);
      return new Response(JSON.stringify({ success: false, error: profErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const haveProfile = new Set(existingProfiles?.map(p => p.session_id) || []);
    const missing = sessionIds.filter(id => !haveProfile.has(id));

    console.log(`backfill: total completed=${sessionIds.length}, with_profile=${haveProfile.size}, missing=${missing.length}`);

    if (dryRun) {
      return new Response(JSON.stringify({ success: true, dryRun: true, missingCount: missing.length, missingSample: missing.slice(0, 20) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let success = 0;
    let failed: Array<{ session_id: string; error: string }> = [];

    // 2) For each missing session, score via existing edge function
    for (const session_id of missing) {
      try {
        const { data, error } = await supabase.functions.invoke('score_prism', {
          body: { session_id },
        });
        if (error) {
          console.error('backfill score error', session_id, error);
          failed.push({ session_id, error: error.message || String(error) });
        } else {
          success += 1;
        }
      } catch (e) {
        console.error('backfill score exception', session_id, e);
        failed.push({ session_id, error: String(e) });
      }
    }

    // 3) Update dashboard stats once
    await supabase.rpc('update_dashboard_statistics');

    return new Response(JSON.stringify({ success: true, processed: missing.length, created: success, failed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('backfill_profiles error', e);
    return new Response(JSON.stringify({ success: false, error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
