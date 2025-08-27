import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, share_token } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ ok: false, reason: "session_id_required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate UUID format early to avoid 22P02 errors
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(session_id);
    if (!isValidUUID) {
      console.error("get-results-by-session: invalid session_id format", { session_id, length: session_id?.length });
      return new Response(JSON.stringify({ ok: false, reason: "invalid_session_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // 1) Load session
    const { data: session, error: sErr } = await supabase
      .from("assessment_sessions")
      .select("id, user_id, status, share_token, completed_at")
      .eq("id", session_id)
      .maybeSingle();

    if (sErr) {
      console.error("get-results-by-session: session fetch error", sErr);
      return new Response(JSON.stringify({ ok: false, reason: "session_fetch_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!session) {
      return new Response(JSON.stringify({ ok: false, reason: "session_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Access check: allow if completed/finalized or share token matches
    const normalizedStatus = (session.status || '').toLowerCase();
    const doneStatuses = new Set(['completed', 'complete', 'finalized', 'scored']);
    const isCompleted = doneStatuses.has(normalizedStatus) || !!session.completed_at;
    const hasShare = !!share_token && typeof share_token === "string" && share_token.length > 0;
    const tokenMatch = hasShare && session.share_token && session.share_token === share_token;

    if (!isCompleted && !tokenMatch) {
      return new Response(JSON.stringify({ ok: false, reason: "access_denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) Get latest profile for this session
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("session_id", session_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pErr) {
      console.error("get-results-by-session: profile fetch error", pErr);
      return new Response(JSON.stringify({ ok: false, reason: "profile_fetch_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile) {
      return new Response(JSON.stringify({ ok: false, reason: "profile_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, session: { id: session.id, status: session.status }, profile }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("get-results-by-session error", e);
    return new Response(JSON.stringify({ ok: false, reason: "server_error", error: e?.message || String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
