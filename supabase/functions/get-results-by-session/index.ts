// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json, resolveOrigin } from "../_shared/cors.ts";
import { rateLimit, ipFrom } from "../_shared/rateLimit.ts";
import { sendConversions } from "../../../src/services/conversions.ts";
import { logger } from "../../../src/lib/logger.ts";

function createAuthedClient(
  supabaseUrl: string,
  anonKey: string,
  authorization: string,
): SupabaseClient {
  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
}

serve(async (req) => {
  const origin = resolveOrigin(req);
  const clientIp = ipFrom(req);
  const rl = rateLimit(`results:${clientIp}`);
  if (!rl.allowed) {
    logger.warn("results.rate_limited", { ip: clientIp });
    const response = json(origin, { ok: false, error: "rate_limited" }, 429);
    response.headers.set("Retry-After", String(rl.retryAfter ?? 60));
    return response;
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders(origin), "Cache-Control": "no-store" } });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json(origin, { ok: false, error: "invalid json body" }, 400);
  }

  const sessionIdRaw = payload.session_id ?? payload.sessionId;
  const shareTokenRaw = payload.share_token ?? payload.shareToken ?? null;

  if (typeof sessionIdRaw !== "string" || !sessionIdRaw.trim()) {
    return json(origin, { ok: false, error: "session_id required" }, 400);
  }

  const sessionId = sessionIdRaw.trim();
  const shareToken =
    typeof shareTokenRaw === "string" && shareTokenRaw.trim().length > 0
      ? shareTokenRaw.trim()
      : null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceKey || !anonKey) {
    logger.error("results.config_missing", {
      session_id: sessionId,
      error: "missing_supabase_env",
    });
    return json(origin, { ok: false, error: "configuration error" }, 500);
  }

  const serviceClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  let dataClient: SupabaseClient = serviceClient;
  let authContext: "share" | "owner" = "share";

  if (shareToken) {
    // SHARE path: validate token with service role
    const { data, error } = await serviceClient
      .from("assessment_sessions")
      .select("share_token")
      .eq("id", sessionId)
      .maybeSingle();

    if (error) {
      logger.error("results.share_token_lookup_failed", {
        session_id: sessionId,
        auth_context: authContext,
        error: error.message,
      });
      return json(origin, { ok: false, error: "session lookup failed" }, 500);
    }

    if (!data || data.share_token !== shareToken) {
      return json(origin, { ok: false, error: "invalid token" }, 401);
    }
  } else {
    // OWNER path: require Authorization, use authed client with RLS
    const authorization = req.headers.get("authorization");
    if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
      return json(origin, { ok: false, error: "authorization required" }, 401);
    }

    const authedClient = createAuthedClient(supabaseUrl, anonKey, authorization);
    const { data, error } = await authedClient
      .from("assessment_sessions")
      .select("id")
      .eq("id", sessionId)
      .maybeSingle();

    if (error) {
      logger.error("results.owner_lookup_failed", {
        session_id: sessionId,
        auth_context: "owner",
        error: error.message,
      });
      return json(origin, { ok: false, error: "session lookup failed" }, 500);
    }

    if (!data) {
      return json(origin, { ok: false, error: "forbidden" }, 403);
    }

    dataClient = authedClient;
    authContext = "owner";
  }

  logger.info("results.start", {
    session_id: sessionId,
    auth_context: authContext,
    has_share_token: Boolean(shareToken),
  });

  try {
    const { data, error } = await dataClient.rpc("get_results_v2", {
      p_session_id: sessionId,
      p_share_token: shareToken,
    });

    if (error) {
      logger.error("results.rpc_error", {
        session_id: sessionId,
        auth_context: authContext,
        error: error.message,
      });
      return json(origin, { ok: false, code: "SCORING_ROWS_MISSING" });
    }

    const result = Array.isArray(data) && data.length > 0 ? (data[0] as Record<string, unknown>) : null;

    const profile = result?.profile as Record<string, unknown> | null | undefined;
    const types = Array.isArray(result?.types) ? (result!.types as unknown[]) : [];
    const functions = Array.isArray(result?.functions) ? (result!.functions as unknown[]) : [];
    const state = Array.isArray(result?.state) ? (result!.state as unknown[]) : [];

    const isComplete =
      profile &&
      Array.isArray(types) && types.length === 16 &&
      Array.isArray(functions) && functions.length === 8 &&
      Array.isArray(state) && state.length > 0;

    if (isComplete && result) {
      const resultsVersionRaw = (result as any).results_version;
      const resultsVersion =
        typeof resultsVersionRaw === "string" && resultsVersionRaw.trim()
          ? resultsVersionRaw.trim()
          : "v2";
      const scoringVersionRaw =
        typeof (result as any).scoring_version === "string"
          ? (result as any).scoring_version
          : typeof (profile?.results_version) === "string"
            ? (profile!.results_version as string)
            : resultsVersion;
      const scoringVersion = scoringVersionRaw.trim();
      const sessionPayload = (result as any).session ?? null;
      const resultIdRaw =
        typeof (result as any).result_id === "string" && (result as any).result_id.trim().length > 0
          ? (result as any).result_id.trim()
          : typeof (sessionPayload as Record<string, unknown> | null)?.id === "string"
            ? ((sessionPayload as Record<string, unknown>).id as string)
            : sessionId;

      logger.info("results.complete", {
        session_id: sessionId,
        auth_context: authContext,
        result_id: resultIdRaw,
        scoring_version: scoringVersion,
      });

      await sendConversions({
        name: "results_viewed",
        sessionId,
        userAgent: req.headers.get("user-agent") ?? undefined,
        ip: clientIp,
      });

      return json(origin, {
        ok: true,
        results_version: resultsVersion,
        result_id: resultIdRaw,
        scoring_version: scoringVersion,
        session: sessionPayload,
        profile,
        types,
        functions,
        state,
      });
    }

    logger.warn("results.missing", {
      session_id: sessionId,
      auth_context: authContext,
      reason: result ? "incomplete_payload" : "no_rows",
      types_length: Array.isArray(types) ? types.length : null,
      functions_length: Array.isArray(functions) ? functions.length : null,
      state_length: Array.isArray(state) ? state.length : null,
    });

    return json(origin, { ok: false, code: "SCORING_ROWS_MISSING" });
  } catch (err) {
    logger.error("results.rpc_exception", {
      session_id: sessionId,
      auth_context: authContext,
      error: err instanceof Error ? err.message : String(err),
    });
    return json(origin, { ok: false, code: "SCORING_ROWS_MISSING" });
  }
});
