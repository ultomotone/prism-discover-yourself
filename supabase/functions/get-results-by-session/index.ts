import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // 1) Load session
    const { data: session, error: sErr } = await supabase
      .from("assessment_sessions")
      .select("id, user_id, status, share_token")
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

    // 2) Access check: allow if completed or share token matches
    const isCompleted = session.status === "completed";
    const hasShare = share_token && typeof share_token === "string" && share_token.length > 0;
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
