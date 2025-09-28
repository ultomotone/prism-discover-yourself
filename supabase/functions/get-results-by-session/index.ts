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

Deno.serve(async (request) => {
  const origin = request.headers.get("Origin") || null;
  const headers = corsHeaders(origin, request);
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers,
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  if (origin && headers["Access-Control-Allow-Origin"] === "") {
    return new Response(JSON.stringify({ ok: false, error: "origin_not_allowed" }), {
      status: 403,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const clientIp = ipFrom(request);
  const rl = rateLimit(`results:${clientIp}`);
  if (!rl.allowed) {
    logger.warn("results.rate_limited", { ip: clientIp });
    if (rl.retryAfter != null) {
      headers["Retry-After"] = String(rl.retryAfter);
    }
    return new Response(JSON.stringify({ ok: false, error: "rate_limited" }), {
      status: 429,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid json body" }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const sessionIdRaw = payload.session_id ?? payload.sessionId;
  const shareTokenRaw = payload.share_token ?? payload.shareToken ?? null;

  if (typeof sessionIdRaw !== "string" || !sessionIdRaw.trim()) {
    return new Response(JSON.stringify({ ok: false, error: "session_id required" }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
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
    return new Response(JSON.stringify({ ok: false, error: "configuration error" }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
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
      return new Response(JSON.stringify({ ok: false, error: "session lookup failed" }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (!data || data.share_token !== shareToken) {
      return new Response(JSON.stringify({ ok: false, error: "invalid token" }), {
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
  } else {
    const authorization = request.headers.get("authorization");
    if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
      return new Response(JSON.stringify({ ok: false, error: "authorization required" }), {
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
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
      return new Response(JSON.stringify({ ok: false, error: "session lookup failed" }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (!data) {
      return new Response(JSON.stringify({ ok: false, error: "forbidden" }), {
        status: 403,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
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
      return new Response(JSON.stringify({ ok: false, code: "SCORING_ROWS_MISSING" }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
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

        return new Response(JSON.stringify({
          ok: true,
          results_version: result.results_version || "v1.2.1",
          result_id: result.result_id || sessionId,
          scoring_version: result.results_version || "v1.2.1",
          session: result.session,
          profile: result.profile,
          types: result.types,
          functions: result.functions,
          state: result.state,
        }), {
          status: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
      
      // Cache miss - need to trigger scoring
      if (result.ok === false && result.code === 'SCORING_ROWS_MISSING') {
        logger.info("results.cache_miss_scoring_needed", {
          session_id: sessionId,
          auth_context: authContext,
        });
        
        // Return the appropriate response to trigger scoring
        return new Response(JSON.stringify({ ok: false, code: "SCORING_ROWS_MISSING" }), {
          status: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
    }

    // Fallback for any other case
    logger.warn("results.unexpected_response", {
      session_id: sessionId,
      auth_context: authContext,
      data_type: typeof data,
    });

    return new Response(JSON.stringify({ ok: false, code: "SCORING_ROWS_MISSING" }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    logger.error("results.rpc_exception", {
      session_id: sessionId,
      auth_context: authContext,
      error: err instanceof Error ? err.message : String(err),
    });
    return new Response(JSON.stringify({ ok: false, code: "SCORING_ROWS_MISSING" }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});