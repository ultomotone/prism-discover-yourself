// Deno Deploy Edge Function
// Schedules-safe, idempotent.
// Force-compute any session with completed_questions >= 248,
// and overwrite profile only if responses_hash unchanged (or profile missing).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PUBLIC_SITE_URL = Deno.env.get("PUBLIC_SITE_URL") ?? "https://prispersonality.com";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

type SessionRow = { id: string; email: string | null; share_token: string | null };

async function ensureShareToken(sessionId: string) {
  const { data: s } = await admin
    .from("assessment_sessions")
    .select("share_token").eq("id", sessionId).single();
  if (!s?.share_token) {
    await admin.from("assessment_sessions")
      .update({ share_token: crypto.randomUUID() })
      .eq("id", sessionId);
  }
}

async function computeResponsesHash(sessionId: string): Promise<string> {
  const { data, error } = await admin.rpc("compute_session_responses_hash", { p_session: sessionId });
  if (error) throw error;
  return data as string;
}

async function getProfile(sessionId: string) {
  const { data, error } = await admin
    .from("profiles")
    .select("session_id, responses_hash, results_version")
    .eq("session_id", sessionId).maybeSingle();
  if (error) throw error;
  return data;
}

async function finalizeOne(sessionId: string) {
  // call finalizeAssessment which wraps score_prism + session completion + token
  const { data, error } = await admin.functions.invoke("finalizeAssessment", {
    body: { session_id: sessionId }
  });
  if (error) throw new Error(`finalizeAssessment failed: ${error.message || JSON.stringify(error)}`);
  return data;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting cron-force-finalize-248 execution");
    
    // Fetch ALL candidate sessions with actual response count (not relying on completed_questions)
    const { data: allSessions, error } = await admin
      .from('assessment_sessions')
      .select('id, email, share_token, completed_questions, total_questions')
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(500);
      
    if (error) {
      console.error("Error fetching sessions:", error);
      throw error;
    }

    // Filter sessions with >= 248 actual responses
    const sessions: SessionRow[] = [];
    for (const session of allSessions || []) {
      const { count: answerCount } = await admin
        .from("assessment_responses")
        .select("id", { count: "exact", head: true })
        .eq("session_id", session.id);
      
      if (answerCount && answerCount >= 248) {
        sessions.push(session as SessionRow);
      }
    }
    console.log(`Found ${sessions?.length || 0} candidate sessions`);
    
    const results: any[] = [];
    for (const s of sessions) {
      try {
        // guard by response hash
        const hash = await computeResponsesHash(s.id);
        const existing = await getProfile(s.id);

        const needsRecompute = !existing || existing.responses_hash !== hash;

        if (needsRecompute) {
          console.log(`Recomputing session ${s.id} (hash changed or no profile)`);
          await ensureShareToken(s.id);
          const out = await finalizeOne(s.id); // upserts profile
          // write responses_hash onto profile (one update to avoid changing scoring)
          await admin.from("profiles").update({ responses_hash: hash }).eq("session_id", s.id);
          
          const { data: tokenData } = await admin
            .from("assessment_sessions")
            .select("share_token")
            .eq("id", s.id)
            .single();
          
          const results_url = `${PUBLIC_SITE_URL}/results/${s.id}?t=${tokenData?.share_token}`;
          results.push({ session_id: s.id, recomputed: true, results_url });
        } else {
          // already up-to-date
          await ensureShareToken(s.id);
          
          const { data: tokenData } = await admin
            .from("assessment_sessions")
            .select("share_token")
            .eq("id", s.id)
            .single();
          
          const results_url = `${PUBLIC_SITE_URL}/results/${s.id}?t=${tokenData?.share_token}`;
          results.push({ session_id: s.id, recomputed: false, results_url });
        }
      } catch (sessionError) {
        console.error(`Error processing session ${s.id}:`, sessionError);
        results.push({ session_id: s.id, error: String(sessionError) });
      }
    }

    console.log(`Processed ${results.length} sessions`);
    
    return new Response(JSON.stringify({ 
      ok: true, 
      count: results.length, 
      results,
      processed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "content-type": "application/json" }
    });
  } catch (e) {
    console.error("Function error:", e);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: String(e),
      processed_at: new Date().toISOString()
    }), { 
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" } 
    });
  }
});
