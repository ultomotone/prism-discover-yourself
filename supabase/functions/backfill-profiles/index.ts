import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const url = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAdmin = createClient(url, serviceKey);

const json = (body: any, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  try {
    const { dryRun = true, sinceDays = 30 } = await req.json().catch(() => ({}));
    const since = new Date(Date.now() - sinceDays * 24 * 3600 * 1000).toISOString();

    console.log(JSON.stringify({ evt: "backfill_start", dryRun, sinceDays }));

    // Find completed sessions missing profiles or with legacy version
    const { data: sessions, error } = await supabaseAdmin
      .from("assessment_sessions")
      .select("id, user_id, profile_id, status, completed_questions")
      .gte("created_at", since)
      .eq("status", "completed")
      .gte("completed_questions", 248);

    if (error) {
      console.log(JSON.stringify({ evt: "backfill_error", error: error.message }));
      return json({ ok: false, error: error.message }, 500);
    }

    // Check which sessions need profiles
    const sessionIds = sessions?.map(s => s.id) || [];
    const { data: existingProfiles } = await supabaseAdmin
      .from("profiles")
      .select("session_id, results_version")
      .in("session_id", sessionIds);

    const profileMap = new Map(existingProfiles?.map(p => [p.session_id, p]) || []);
    
    const sessionsNeedingProfiles = sessions?.filter(session => {
      const existingProfile = profileMap.get(session.id);
      return !existingProfile || 
             !existingProfile.results_version || 
             existingProfile.results_version < "v1.2.1";
    }) || [];

    console.log(JSON.stringify({ 
      evt: "backfill_analysis", 
      total_sessions: sessions?.length || 0,
      needs_backfill: sessionsNeedingProfiles.length 
    }));

    if (dryRun) {
      return json({
        ok: true,
        dryRun: true,
        count: sessionsNeedingProfiles.length,
        sessions: sessionsNeedingProfiles.slice(0, 10).map(s => ({
          session_id: s.id,
          action: "would_rescore",
          has_profile: profileMap.has(s.id),
          current_version: profileMap.get(s.id)?.results_version || null
        }))
      });
    }

    const results = [];
    let processed = 0;
    
    for (const session of sessionsNeedingProfiles) {
      try {
        console.log(JSON.stringify({ evt: "backfill_processing", session_id: session.id }));

        // Best-effort FC scoring
        try {
          await supabaseAdmin.functions.invoke("score_fc_session", {
            body: { session_id: session.id, version: "v1.2", basis: "functions" },
          });
        } catch (fcError: any) {
          console.log(JSON.stringify({ evt: "backfill_fc_skip", session_id: session.id, error: fcError?.message }));
        }

        // Required PRISM scoring
        const { data: prismResult, error: prismError } = await supabaseAdmin.functions.invoke("score_prism", {
          body: { session_id: session.id },
        });

        if (prismError || prismResult?.status !== "success") {
          console.log(JSON.stringify({ 
            evt: "backfill_prism_failed", 
            session_id: session.id, 
            error: prismError?.message || prismResult?.error 
          }));
          results.push({ session_id: session.id, rescored: false, error: prismError?.message || prismResult?.error });
          continue;
        }

        // Update session with profile_id if needed
        if (prismResult.profile?.id) {
          await supabaseAdmin
            .from("assessment_sessions")
            .update({ profile_id: prismResult.profile.id })
            .eq("id", session.id);
        }

        processed++;
        results.push({ session_id: session.id, rescored: true, profile_id: prismResult.profile?.id });
        
        console.log(JSON.stringify({ 
          evt: "backfill_success", 
          session_id: session.id, 
          profile_id: prismResult.profile?.id 
        }));

      } catch (sessionError: any) {
        console.log(JSON.stringify({ 
          evt: "backfill_session_error", 
          session_id: session.id, 
          error: sessionError.message 
        }));
        results.push({ session_id: session.id, rescored: false, error: sessionError.message });
      }
    }

    console.log(JSON.stringify({ 
      evt: "backfill_complete", 
      total_processed: processed, 
      total_attempted: sessionsNeedingProfiles.length 
    }));

    return json({
      ok: true,
      dryRun: false,
      count: sessionsNeedingProfiles.length,
      processed,
      results: results.slice(0, 50) // Limit output size
    });

  } catch (e: any) {
    console.log(JSON.stringify({ evt: "backfill_fatal_error", error: e.message }));
    return json({ ok: false, error: e.message }, 500);
  }
});