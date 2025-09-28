// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
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
    const { lookbackDays = 30, limit = 200, dryRun = true } = await req.json().catch(() => ({}));
    const since = new Date(Date.now() - lookbackDays * 24 * 3600 * 1000).toISOString();

    console.log(JSON.stringify({ evt: "admin_backfill_start", lookbackDays, limit, dryRun }));

    // Find completed sessions missing profiles or with legacy version
    const { data: sessions, error } = await supabaseAdmin
      .from("assessment_sessions")
      .select("id, user_id, status, completed_questions, completed_at")
      .gte("created_at", since)
      .eq("status", "completed")
      .gte("completed_questions", 248)
      .limit(limit);

    if (error) {
      console.log(JSON.stringify({ evt: "admin_backfill_error", error: error.message }));
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
      evt: "admin_backfill_analysis", 
      total_sessions: sessions?.length || 0,
      needs_backfill: sessionsNeedingProfiles.length 
    }));

    if (dryRun) {
      return json({
        ok: true,
        dryRun: true,
        attempted: sessionsNeedingProfiles.length,
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
    
    // Process in batches with concurrency limit
    const BATCH_SIZE = 10;
    for (let i = 0; i < sessionsNeedingProfiles.length; i += BATCH_SIZE) {
      const batch = sessionsNeedingProfiles.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        batch.map(async (session) => {
          try {
            console.log(JSON.stringify({ evt: "admin_backfill_processing", session_id: session.id }));

            // Best-effort FC scoring
            try {
              await supabaseAdmin.functions.invoke("score_fc_session", {
                body: { session_id: session.id, version: "v1.2", basis: "functions" },
              });
            } catch (fcError: any) {
              console.log(JSON.stringify({ evt: "admin_backfill_fc_skip", session_id: session.id, error: fcError?.message }));
            }

            // Required PRISM scoring
            const { data: prismResult, error: prismError } = await supabaseAdmin.functions.invoke("score_prism", {
              body: { session_id: session.id },
            });

            if (prismError || prismResult?.status !== "success") {
              console.log(JSON.stringify({ 
                evt: "admin_backfill_prism_failed", 
                session_id: session.id, 
                error: prismError?.message || prismResult?.error 
              }));
              results.push({ session_id: session.id, rescored: false, error: prismError?.message || prismResult?.error });
              return;
            }

            // Update session with share token if needed
            const share_token = crypto.randomUUID();
            const share_token_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            
            await supabaseAdmin
              .from("assessment_sessions")
              .update({ 
                share_token,
                share_token_expires_at,
                finalized_at: new Date().toISOString()
              })
              .eq("id", session.id);

            processed++;
            results.push({ session_id: session.id, rescored: true, profile_id: prismResult.profile?.id });
            
            console.log(JSON.stringify({ 
              evt: "admin_backfill_success", 
              session_id: session.id, 
              profile_id: prismResult.profile?.id 
            }));

          } catch (sessionError: any) {
            console.log(JSON.stringify({ 
              evt: "admin_backfill_session_error", 
              session_id: session.id, 
              error: sessionError.message 
            }));
            results.push({ session_id: session.id, rescored: false, error: sessionError.message });
          }
        })
      );

      // Log progress every batch
      if ((i + BATCH_SIZE) % 25 === 0 || i + BATCH_SIZE >= sessionsNeedingProfiles.length) {
        console.log(JSON.stringify({ 
          evt: "admin_backfill_progress", 
          completed: Math.min(i + BATCH_SIZE, sessionsNeedingProfiles.length), 
          total: sessionsNeedingProfiles.length 
        }));
      }
    }

    console.log(JSON.stringify({ 
      evt: "admin_backfill_complete", 
      total_processed: processed, 
      total_attempted: sessionsNeedingProfiles.length 
    }));

    return json({
      ok: true,
      dryRun: false,
      attempted: sessionsNeedingProfiles.length,
      succeeded: processed,
      failed: sessionsNeedingProfiles.length - processed,
      results: results.slice(0, 50) // Limit output size
    });

  } catch (e: any) {
    console.log(JSON.stringify({ evt: "admin_backfill_fatal_error", error: e.message }));
    return json({ ok: false, error: e.message }, 500);
  }
});