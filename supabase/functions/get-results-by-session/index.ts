import { Hono } from "npm:hono@4.5.11";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

import { rateLimit, ipFrom } from "../_shared/rateLimit.ts";
import { sendConversions } from "../../../src/services/conversions.ts";
import { logger } from "../../../src/lib/logger.ts";

const STATIC_ORIGINS = new Set([
  "https://prismpersonality.com",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false;
  if (STATIC_ORIGINS.has(origin)) return true;
  try {
    const u = new URL(origin);
    return (
      u.hostname.endsWith(".lovable.app") ||
      u.hostname.endsWith(".lovableproject.com")
    );
  } catch {
    return false;
  }
}

function corsHeaders(origin: string | null, req: Request) {
  const allowedOrigin = isAllowedOrigin(origin) ? origin! : "";
  const reqHeaders =
    req.headers.get("Access-Control-Request-Headers") ??
    "authorization, x-client-info, apikey, content-type";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": reqHeaders,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin, Access-Control-Request-Headers",
  } as Record<string, string>;
}

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

const app = new Hono();

app.options("/*", (c) =>
  c.newResponse(null, {
    status: 200,
    headers: corsHeaders(c.req.header("Origin") || null, c.req.raw),
  })
);

app.post("/get-results-by-session", async (c) => {
  const origin = c.req.header("Origin") || null;
  const headers = corsHeaders(origin, c.req.raw);
  if (origin && headers["Access-Control-Allow-Origin"] === "") {
    return c.json({ ok: false, error: "origin_not_allowed" }, 403, headers);
  }

  const request = c.req.raw;
  const clientIp = ipFrom(request);
  const rl = rateLimit(`results:${clientIp}`);
  if (!rl.allowed) {
    logger.warn("results.rate_limited", { ip: clientIp });
    if (rl.retryAfter != null) {
      headers["Retry-After"] = String(rl.retryAfter);
    }
    return c.json({ ok: false, error: "rate_limited" }, 429, headers);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ ok: false, error: "invalid json body" }, 400, headers);
  }

  const sessionIdRaw = payload.session_id ?? payload.sessionId;
  const shareTokenRaw = payload.share_token ?? payload.shareToken ?? null;

  if (typeof sessionIdRaw !== "string" || !sessionIdRaw.trim()) {
    return c.json({ ok: false, error: "session_id required" }, 400, headers);
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
    return c.json({ ok: false, error: "configuration error" }, 500, headers);
  }

  const serviceClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  let dataClient: SupabaseClient = serviceClient;
  let authContext: "share" | "owner" = "share";

  if (shareToken) {
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
      return c.json({ ok: false, error: "session lookup failed" }, 500, headers);
    }

    if (!data || data.share_token !== shareToken) {
      return c.json({ ok: false, error: "invalid token" }, 401, headers);
    }
  } else {
    const authorization = request.headers.get("authorization");
    if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
      return c.json({ ok: false, error: "authorization required" }, 401, headers);
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
      return c.json({ ok: false, error: "session lookup failed" }, 500, headers);
    }

    if (!data) {
      return c.json({ ok: false, error: "forbidden" }, 403, headers);
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
      return c.json({ ok: false, code: "SCORING_ROWS_MISSING" }, 200, headers);
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
        userAgent: request.headers.get("user-agent") ?? undefined,
        ip: clientIp,
      });

      return c.json({
        ok: true,
        results_version: resultsVersion,
        result_id: resultIdRaw,
        scoring_version: scoringVersion,
        session: sessionPayload,
        profile,
        types,
        functions,
        state,
      }, 200, headers);
    }

    logger.warn("results.missing", {
      session_id: sessionId,
      auth_context: authContext,
      reason: result ? "incomplete_payload" : "no_rows",
      types_length: Array.isArray(types) ? types.length : null,
      functions_length: Array.isArray(functions) ? functions.length : null,
      state_length: Array.isArray(state) ? state.length : null,
    });

    return c.json({ ok: false, code: "SCORING_ROWS_MISSING" }, 200, headers);
  } catch (err) {
    logger.error("results.rpc_exception", {
      session_id: sessionId,
      auth_context: authContext,
      error: err instanceof Error ? err.message : String(err),
    });
    return c.json({ ok: false, code: "SCORING_ROWS_MISSING" }, 200, headers);
  }
});

Deno.serve((req) => app.fetch(req));
