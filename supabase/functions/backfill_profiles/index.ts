import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import {
  findSessionsNeedingProfile,
  SessionRecord,
} from "../_shared/backfillUtils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
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

    // 1) Load sessions from last 90 days that might need profiles
    const ninetyDaysAgo = new Date(
      Date.now() - 90 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const { data: candidateSessions, error: sessErr } = await supabase
      .from('assessment_sessions')
      .select('id,status,completed_questions,total_questions,completed_at')
      .in('status', ['completed', 'in_progress'])
      .gte('started_at', ninetyDaysAgo);

    if (sessErr) {
      console.error('backfill: sessions error', sessErr);
      return new Response(JSON.stringify({ success: false, error: sessErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const sessions = (candidateSessions || []) as SessionRecord[];
    const sessionIds = sessions.map((s) => s.id);

    // Load profiles for these sessions
    const { data: existingProfiles, error: profErr } = await supabase
      .from('profiles')
      .select('session_id')
      .in('session_id', sessionIds);

    if (profErr) {
      console.error('backfill: profiles error', profErr);
      return new Response(JSON.stringify({ success: false, error: profErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const missingSessions = findSessionsNeedingProfile(
      sessions,
      existingProfiles || [],
    );

    console.log(
      `backfill: total candidates=${sessions.length}, with_profile=${(existingProfiles || []).length}, missing=${missingSessions.length}`,
    );

    if (dryRun) {
      return new Response(
        JSON.stringify({
          success: true,
          dryRun: true,
          missingCount: missingSessions.length,
          missingSample: missingSessions.slice(0, 20).map((s) => s.id),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    let success = 0;
    const failed: Array<{ session_id: string; error: string }> = [];

    // 2) For each missing session, mark complete and score
    for (const sess of missingSessions) {
      const session_id = sess.id;
      try {
        await supabase
          .from('assessment_sessions')
          .update({
            status: 'completed',
            completed_at: sess.completed_at || new Date().toISOString(),
            completed_questions: sess.completed_questions ?? sess.total_questions,
          })
          .eq('id', session_id);

        const { error } = await supabase.functions.invoke('score_prism', {
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

    return new Response(
      JSON.stringify({
        success: true,
        processed: missingSessions.length,
        created: success,
        failed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('backfill_profiles error', e);
    return new Response(JSON.stringify({ success: false, error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
