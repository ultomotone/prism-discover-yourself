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
    // Call the correct RPC function with the right parameter
    const { data, error } = await dataClient.rpc("get_results_v2", {
      session_id: sessionId,
    });

    if (error) {
      logger.error("results.rpc_error", {
        session_id: sessionId,
        auth_context: authContext,
        error: error.message,
      });
      return c.json({ ok: false, code: "SCORING_ROWS_MISSING" }, 200, headers);
    }

    // Handle the response format from our updated RPC
    if (data && typeof data === 'object') {
      const result = data as Record<string, unknown>;
      
      // Check if this is a cached result
      if (result.ok === true && result.source === 'cache') {
        logger.info("results.cache_hit", {
          session_id: sessionId,
          auth_context: authContext,
        });

        await sendConversions({
          name: "results_viewed",
          sessionId,
          userAgent: request.headers.get("user-agent") ?? undefined,
          ip: clientIp,
        });

        return c.json({
          ok: true,
          results_version: result.results_version || "v1.2.1",
          result_id: result.result_id || sessionId,
          scoring_version: result.results_version || "v1.2.1",
          session: result.session,
          profile: result.profile,
          types: result.types,
          functions: result.functions,
          state: result.state,
        }, 200, headers);
      }
      
      // Cache miss - need to trigger scoring
      if (result.ok === false && result.code === 'SCORING_ROWS_MISSING') {
        logger.info("results.cache_miss_scoring_needed", {
          session_id: sessionId,
          auth_context: authContext,
        });
        
        // Return the appropriate response to trigger scoring
        return c.json({ ok: false, code: "SCORING_ROWS_MISSING" }, 200, headers);
      }
    }

    // Fallback for any other case
    logger.warn("results.unexpected_response", {
      session_id: sessionId,
      auth_context: authContext,
      data_type: typeof data,
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
