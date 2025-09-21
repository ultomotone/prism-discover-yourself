// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---- CORS helpers (preview + prod domains, wildcard support) ----
const defaultOrigin = Deno.env.get("RESULTS_ALLOWED_ORIGIN") ?? "https://prismpersonality.com";

const ORIGIN_ALLOWLIST: Array<string | RegExp> = [
  defaultOrigin,
  "https://prismpersonality.com",
  "https://www.prismpersonality.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://lovable.dev",
  /\.lovable\.app$/i,
  /\.lovableproject\.com$/i,
];

function isAllowedOrigin(origin: string): boolean {
  return ORIGIN_ALLOWLIST.some((rule) =>
    typeof rule === "string" ? rule === origin : (rule as RegExp).test(origin)
  );
}

function normalizeOrigin(value: string | null): string | null {
  if (!value) return null;
  try {
    const { origin } = new URL(value);
    return origin;
  } catch {
    return null;
  }
}

function resolveOrigin(req: Request): string {
  const originHeader = normalizeOrigin(req.headers.get("origin"));
  if (originHeader && isAllowedOrigin(originHeader)) {
    return originHeader;
  }
  return defaultOrigin;
}

function buildCorsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin, Authorization",
  };
}

function jsonResponse(origin: string, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...buildCorsHeaders(origin),
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
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

serve(async (req) => {
  const origin = resolveOrigin(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { ...buildCorsHeaders(origin), "Cache-Control": "no-store" } });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(origin, { ok: false, error: "invalid json body" }, 400);
  }

  const sessionIdRaw = payload.session_id ?? payload.sessionId;
  const shareTokenRaw = payload.share_token ?? payload.shareToken ?? null;

  if (typeof sessionIdRaw !== "string" || !sessionIdRaw.trim()) {
    return jsonResponse(origin, { ok: false, error: "session_id required" }, 400);
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
    console.error(JSON.stringify({
      evt: "results_v3_start",
      session_id: sessionId,
      error: "missing_supabase_env",
      timestamp: new Date().toISOString(),
    }));
    return jsonResponse(origin, { ok: false, error: "configuration error" }, 500);
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
      console.error(JSON.stringify({
        evt: "results_v3_missing",
        session_id: sessionId,
        auth_context: authContext,
        reason: "token_lookup_failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      }));
      return jsonResponse(origin, { ok: false, error: "session lookup failed" }, 500);
    }

    if (!data || data.share_token !== shareToken) {
      return jsonResponse(origin, { ok: false, error: "invalid token" }, 401);
    }
  } else {
    // OWNER path: require Authorization, use authed client with RLS
    const authorization = req.headers.get("authorization");
    if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
      return jsonResponse(origin, { ok: false, error: "authorization required" }, 401);
    }

    const authedClient = createAuthedClient(supabaseUrl, anonKey, authorization);
    const { data, error } = await authedClient
      .from("assessment_sessions")
      .select("id")
      .eq("id", sessionId)
      .maybeSingle();

    if (error) {
      console.error(JSON.stringify({
        evt: "results_v3_missing",
        session_id: sessionId,
        auth_context: "owner",
        reason: "session_lookup_failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      }));
      return jsonResponse(origin, { ok: false, error: "session lookup failed" }, 500);
    }

    if (!data) {
      return jsonResponse(origin, { ok: false, error: "forbidden" }, 403);
    }

    dataClient = authedClient;
    authContext = "owner";
  }

  console.log(JSON.stringify({
    evt: "results_v3_start",
    session_id: sessionId,
    auth_context: authContext,
    has_share_token: Boolean(shareToken),
    timestamp: new Date().toISOString(),
  }));

  try {
    const { data, error } = await dataClient.rpc("get_results_v2", {
      p_session_id: sessionId,
      p_share_token: shareToken,
    });

    if (error) {
      console.log(JSON.stringify({
        evt: "results_v3_rpc_error",
        session_id: sessionId,
        auth_context: authContext,
        error: error.message,
        timestamp: new Date().toISOString(),
      }));
      return jsonResponse(origin, { ok: false, code: "SCORING_ROWS_MISSING" });
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

      console.log(JSON.stringify({
        evt: "results_v3_complete",
        session_id: sessionId,
        auth_context: authContext,
        result_id: resultIdRaw,
        scoring_version: scoringVersion,
        timestamp: new Date().toISOString(),
      }));

      return jsonResponse(origin, {
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

    console.log(JSON.stringify({
      evt: "results_v3_missing",
      session_id: sessionId,
      auth_context: authContext,
      reason: result ? "incomplete_payload" : "no_rows",
      types_length: Array.isArray(types) ? types.length : null,
      functions_length: Array.isArray(functions) ? functions.length : null,
      state_length: Array.isArray(state) ? state.length : null,
      timestamp: new Date().toISOString(),
    }));

    return jsonResponse(origin, { ok: false, code: "SCORING_ROWS_MISSING" });
  } catch (err) {
    console.log(JSON.stringify({
      evt: "results_v3_rpc_error",
      session_id: sessionId,
      auth_context: authContext,
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    }));
    return jsonResponse(origin, { ok: false, code: "SCORING_ROWS_MISSING" });
  }
});
