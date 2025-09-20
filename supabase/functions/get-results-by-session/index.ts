import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

type AuthContext = "token" | "owner";

const defaultOrigin = Deno.env.get("RESULTS_ALLOWED_ORIGIN") ?? "https://prismpersonality.com";
const allowedOrigins = new Set([
  defaultOrigin,
  "https://prismpersonality.com",
  "https://www.prismpersonality.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function resolveOrigin(req: Request): string {
  const origin = req.headers.get("origin");
  if (origin && allowedOrigins.has(origin)) {
    return origin;
  }
  return defaultOrigin;
}

function buildCorsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
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
  authorization: string
): SupabaseClient {
  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
    auth: { persistSession: false },
  });
}

serve(async (req) => {
  const origin = resolveOrigin(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...buildCorsHeaders(origin),
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    const body = await req.json();
    const sessionId: string | undefined = body.session_id ?? body.sessionId;
    const shareToken: string | null = body.share_token ?? body.shareToken ?? null;

    console.log(
      JSON.stringify({
        evt: "results_v2_start",
        session_id: sessionId,
        has_token: !!shareToken,
        timestamp: new Date().toISOString(),
      }),
    );

    if (!sessionId) {
      return jsonResponse(origin, { ok: false, error: "session_id required" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceKey || !anonKey) {
      console.error("Missing Supabase configuration");
      return jsonResponse(origin, { ok: false, error: "configuration error" }, 500);
    }

    const serviceClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    let dataClient: SupabaseClient = serviceClient;
    let authContext: AuthContext = "token";

    if (!shareToken) {
      const authorization = req.headers.get("authorization");
      if (!authorization || !authorization.startsWith("Bearer ")) {
        return jsonResponse(origin, { ok: false, error: "authorization required" }, 401);
      }

      const authedClient = createAuthedClient(supabaseUrl, anonKey, authorization);
      const { data: userResponse, error: userError } = await authedClient.auth.getUser();

      if (userError) {
        console.error("Failed to load authenticated user", userError);
        return jsonResponse(origin, { ok: false, error: "unauthorized" }, 401);
      }

      const user = userResponse?.user;
      if (!user) {
        return jsonResponse(origin, { ok: false, error: "unauthorized" }, 401);
      }

      const { data: sessionRow, error: sessionError } = await authedClient
        .from("assessment_sessions")
        .select("id")
        .eq("id", sessionId)
        .maybeSingle();

      if (sessionError) {
        console.error("session lookup failed", sessionError);
        return jsonResponse(origin, { ok: false, error: "session lookup failed" }, 500);
      }

      if (!sessionRow) {
        return jsonResponse(origin, { ok: false, error: "forbidden" }, 403);
      }

      dataClient = authedClient;
      authContext = "owner";
    } else {
      const { data: sess, error: sessionError } = await serviceClient
        .from("assessment_sessions")
        .select("share_token")
        .eq("id", sessionId)
        .maybeSingle();

      if (sessionError) {
        console.error("share token lookup failed", sessionError);
        return jsonResponse(origin, { ok: false, error: "session lookup failed" }, 500);
      }

      if (!sess || sess.share_token !== shareToken) {
        return jsonResponse(origin, { ok: false, error: "invalid token" }, 401);
      }
    }

    try {
      const { data, error } = await dataClient.rpc("get_results_v2", {
        p_session_id: sessionId,
        p_share_token: shareToken,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        const result = data[0];
        const { session, profile, types, functions, state } = result as Record<string, unknown>;

        if (
          Array.isArray(types) &&
          types.length === 16 &&
          Array.isArray(functions) &&
          functions.length === 8 &&
          Array.isArray(state) &&
          state.length > 0
        ) {
          console.log(
            JSON.stringify({
              evt: "results_v2_complete",
              session_id: sessionId,
              auth_context: authContext,
              types_count: types.length,
              functions_count: functions.length,
              state_count: state.length,
              timestamp: new Date().toISOString(),
            }),
          );

          return jsonResponse(origin, {
            ok: true,
            results_version: "v2",
            session,
            profile,
            types,
            functions,
            state,
          });
        }
      }
    } catch (rpcError) {
      const errorMessage = rpcError instanceof Error ? rpcError.message : String(rpcError);
      console.log(
        JSON.stringify({
          evt: "results_v2_rpc_error",
          session_id: sessionId,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }),
      );
    }

    const { data: profile, error: profileError } = await dataClient
      .from("profiles")
      .select(
        `
        session_id, type_code, base_func, creative_func, top_types, top_3_fits,
        score_fit_raw, score_fit_calibrated, fit_band, top_gap, close_call,
        strengths, dimensions, blocks_norm, overlay, conf_raw, conf_calibrated,
        confidence, results_version, created_at
      `,
      )
      .eq("session_id", sessionId)
      .maybeSingle();

    if (profileError) {
      console.log(
        JSON.stringify({
          evt: "results_fallback_missing",
          session_id: sessionId,
          error: profileError.message,
          timestamp: new Date().toISOString(),
        }),
      );
      return jsonResponse(origin, { ok: false, error: "no results found" }, 404);
    }

    if (!profile) {
      return jsonResponse(origin, { ok: false, error: "no results found" }, 404);
    }

    const typedProfile = profile as Record<string, unknown>;

    console.log(
      JSON.stringify({
        evt: "results_v1_fallback",
        session_id: sessionId,
        auth_context: authContext,
        timestamp: new Date().toISOString(),
      }),
    );

    return jsonResponse(origin, {
      ok: true,
      results_version: (typedProfile.results_version as string | undefined) ?? "v1.2.1",
      session: { id: sessionId, created_at: typedProfile.created_at },
      profile,
      types: null,
      functions: null,
      state: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in get-results-by-session:", message);
    return jsonResponse(origin, { ok: false, error: message || "Internal server error" }, 500);
  }
});