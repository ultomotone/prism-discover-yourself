import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json, resolveOrigin } from "../_shared/cors.ts";

interface LinkRequest {
  session_id: string;
  user_id: string;
  email?: string;
}

serve(async (req) => {
  const origin = resolveOrigin(req);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    // reflect access-control-request-headers if present
    return new Response(null, { headers: corsHeaders(origin, req) });
  }

  try {
    const authorization = req.headers.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return json(origin, { success: false, error: "unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceKey || !anonKey) {
      console.error("Missing Supabase configuration");
      return json(origin, { success: false, error: "configuration_error" }, 500);
    }

    const authedClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });

    const { data: userResult, error: userError } = await authedClient.auth.getUser();
    if (userError) {
      console.error("Failed to load authenticated user", userError);
      return json(origin, { success: false, error: "unauthorized" }, 401);
    }

    const authUser = userResult?.user;
    if (!authUser) {
      return json(origin, { success: false, error: "unauthorized" }, 401);
    }

    const { session_id, user_id, email }: LinkRequest = await req.json();

    if (!session_id || !user_id) {
      return json(origin, { success: false, error: "missing_params" }, 400);
    }

    if (authUser.id !== user_id) {
      return json(origin, { success: false, error: "user_mismatch" }, 403);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // Check current session state
    const { data: sess } = await supabase
      .from("assessment_sessions")
      .select("user_id")
      .eq("id", session_id)
      .maybeSingle();

    if (!sess) {
      return json(origin, { success: false, error: "not_found" }, 404);
    }

    // Already linked to same user - no-op
    if (sess.user_id && sess.user_id === user_id) {
      return json(origin, { success: true, note: "already linked" });
    }

    // Already linked to different user - conflict
    if (sess.user_id && sess.user_id !== user_id) {
      return json(origin, { success: false, code: "ALREADY_LINKED" }, 409);
    }

    // Link the session
    const { error: updErr } = await supabase
      .from("assessment_sessions")
      .update({ user_id, email: email ?? authUser.email ?? null })
      .eq("id", session_id);

    if (updErr) {
      console.error("Update error:", updErr);
      return json(origin, { success: false, error: "link_failed" }, 500);
    }

    return json(origin, { success: true });

  } catch (e: any) {
    console.error("link_session_to_account error:", e?.message || e);
    return json(origin, { success: false, error: e?.message || "link_failed" }, 500);
  }
});