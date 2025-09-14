import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildResultsLink } from "../_shared/results-link.ts";

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(url, key);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

const json = (body: any, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { session_id, responses } = await req.json();
    if (!session_id) return json({ status: "error", error: "session_id required" }, 400);

    // FC scoring (best-effort)
    try {
      await supabase.functions.invoke("score_fc_session", { body: { session_id } });
    } catch {
      /* ignore */
    }

    // Profile scoring
    const { data, error } = await supabase.functions.invoke("score_prism", { body: { session_id } });
    if (error || data?.status !== "success" || !data?.profile) {
      return json({ status: "error", error: error?.message || data?.error || "scoring failed" }, 422);
    }
    // Share token + session update
    const { data: sessRow } = await supabase
      .from("assessment_sessions")
      .select("share_token, share_token_expires_at")
      .eq("id", session_id)
      .single();
    const share_token = sessRow?.share_token ?? crypto.randomUUID();
    const ttl = sessRow?.share_token_expires_at ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from("profiles").update({ share_token }).eq("session_id", session_id);
    const { error: sessionUpdateError } = await supabase
      .from("assessment_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        finalized_at: new Date().toISOString(),
        completed_questions: responses ? new Set(responses.map((r: any) => r.question_id)).size : 0,
        share_token,
        share_token_expires_at: ttl,
        profile_id: data.profile.id,
      })
      .eq("id", session_id);
    if (sessionUpdateError) return json({ status: "error", error: sessionUpdateError.message }, 500);

    const siteUrl =
      Deno.env.get("RESULTS_BASE_URL") ||
      req.headers.get("origin") ||
      "https://prismassessment.com";

    const resultsUrl = buildResultsLink(siteUrl, session_id, share_token);
    return json(
      { status: "success", session_id, share_token, profile: { ...data.profile, share_token }, results_url: resultsUrl },
      200,
    );
  } catch (e: any) {
    return json({ status: "error", error: e?.message || "Internal server error" }, 500);
  }
});

