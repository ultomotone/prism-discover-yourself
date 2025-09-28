// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildResultsLink } from "../_shared/results-link.ts";
import { ensureResultsVersion, RESULTS_VERSION } from "../_shared/resultsVersion.ts";
import {
  FinalizeAssessmentError,
  finalizeAssessmentCore,
  type ProfileRow,
  type SessionRow,
} from "../_shared/finalizeAssessmentCore.ts";
import { buildCompletionLog } from "../_shared/observability.ts";
import { emitMetric, withTimer } from "../_shared/metrics.ts";
import { corsHeaders, json, resolveOrigin } from "../_shared/cors.ts";
import { rateLimit, ipFrom } from "../_shared/rateLimit.ts";
// Remove invalid imports - these files don't exist in edge function context

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(url, key);

// await ensureResultsVersion(supabase); // Commented out to fix build error

interface SupabaseProfileRow extends ProfileRow {
  created_at?: string | null;
  updated_at?: string | null;
}

interface SupabaseSessionRow extends SessionRow {
  share_token_expires_at: string | null;
  completed_questions: number | null;
  finalized_at: string | null;
  completed_at: string | null;
  status: string | null;
  updated_at: string | null;
  user_id: string | null;
  metadata: Record<string, unknown> | null;
}

const sessionLocks = new Map<string, Promise<void>>();

async function acquireSessionLock(sessionId: string): Promise<() => void> {
  const existing = sessionLocks.get(sessionId) ?? Promise.resolve();
  let releaseCurrent: (() => void) | null = null;
  const current = existing.finally(() => new Promise<void>((resolve) => {
    releaseCurrent = resolve;
  }));
  sessionLocks.set(sessionId, current);
  await existing;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (releaseCurrent) releaseCurrent();
    if (sessionLocks.get(sessionId) === current) {
      sessionLocks.delete(sessionId);
    }
  };
}

async function getProfile(sessionId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) {
    throw new Error(`failed to load profile: ${error.message}`);
  }
  return (data as SupabaseProfileRow | null) ?? null;
}

async function normalizeProfile(profile: ProfileRow): Promise<ProfileRow> {
  const needsUpdate = profile.results_version !== RESULTS_VERSION || profile.version !== RESULTS_VERSION;
  if (!needsUpdate) {
    return { ...profile, results_version: RESULTS_VERSION, version: RESULTS_VERSION };
  }
  const { data, error } = await supabase
    .from("profiles")
    .update({ results_version: RESULTS_VERSION, version: RESULTS_VERSION })
    .eq("id", profile.id)
    .select("*")
    .maybeSingle();
  if (error) {
    throw new Error(`failed to stamp profile version: ${error.message}`);
  }
  const stamped = (data as SupabaseProfileRow | null) ?? profile;
  return { ...stamped, results_version: RESULTS_VERSION, version: RESULTS_VERSION };
}

async function getSession(sessionId: string): Promise<SessionRow | null> {
  const { data, error } = await supabase
    .from("assessment_sessions")
    .select(
      "id, share_token, share_token_expires_at, completed_at, finalized_at, completed_questions, status, updated_at, user_id, metadata",
    )
    .eq("id", sessionId)
    .maybeSingle();
  if (error) {
    throw new Error(`failed to load session: ${error.message}`);
  }
  return (data as SupabaseSessionRow | null) ?? null;
}

async function upsertSession(sessionId: string, patch: Partial<SessionRow>): Promise<void> {
  const { error } = await supabase
    .from("assessment_sessions")
    .upsert({ id: sessionId, ...patch }, { onConflict: "id" });
  if (error) {
    throw new Error(`failed to update session: ${error.message}`);
  }
}

async function scoreFcSession(sessionId: string): Promise<void> {
  const { error } = await supabase.functions.invoke("score_fc_session", {
    body: { session_id: sessionId, version: "v1.2", basis: "functions" },
  });
  if (error) {
    throw new Error(error.message);
  }
}

async function scorePrism(sessionId: string) {
  const { data, error } = await supabase.functions.invoke("score_prism", { body: { session_id: sessionId } });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

function generateShareToken(): string {
  return crypto.randomUUID();
}

function resolveSiteUrl(req: Request): string {
  return (
    Deno.env.get("RESULTS_BASE_URL") ||
    req.headers.get("origin") ||
    "https://prismassessment.com"
  );
}

Deno.serve(async (req) => {
  const origin = resolveOrigin(req);
  if (req.method === "OPTIONS") {
    // reflect access-control-request-headers if present
    return new Response(null, { headers: corsHeaders(origin, req) });
  }
  const clientIp = ipFrom(req);
  const rl = rateLimit(`finalize:${clientIp}`);
  if (!rl.allowed) {
    console.warn("assessment.finalize.rate_limited", { ip: clientIp });
    const response = json(origin, { status: "error", error: "rate_limited" }, 429);
    response.headers.set("Retry-After", String(rl.retryAfter ?? 60));
    return response;
  }
  let sessionId: string | undefined;
  try {
    const body = await req.json();
    sessionId = body?.session_id;
    const responses = body?.responses;
    if (!sessionId || typeof sessionId !== 'string') {
      await emitMetric("assessment.finalize.error", {
        session_id: null,
        RESULTS_VERSION,
      });
      return json(origin, { status: "error", error: "session_id required" }, 400);
    }

    const timed = await withTimer(() =>
      finalizeAssessmentCore(
        {
          acquireLock: (sessionId) => acquireSessionLock(sessionId),
          getProfile,
          normalizeProfile,
          scoreFcSession,
          scorePrism,
          getSession,
          upsertSession,
          generateShareToken,
          buildResultsUrl: (baseUrl, resultId, token, scoringVersion) =>
            buildResultsLink(baseUrl, resultId, token, { scoringVersion }),
          now: () => new Date(),
          log: (payload) => console.info("assessment.finalize.core", payload),
        },
        {
          sessionId: sessionId!, // We've already validated this is string above
          responses,
          siteUrl: resolveSiteUrl(req),
        },
      ),
    );

    if (timed.error) {
      throw timed.error;
    }

    const finalizeResult = timed.result!;
    const { session: finalizedSession, path, ...responseBody } = finalizeResult;
    const logPayload = buildCompletionLog({
      event: "assessment.completed",
      sessionId,
      profile: finalizeResult.profile,
      session: finalizedSession,
      resultsVersion: finalizeResult.results_version,
      durationMs: timed.durationMs,
      extra: { path },
    });

    console.info("assessment.finalize.complete", logPayload);

    await emitMetric("assessment.finalize.success", {
      session_id: sessionId,
      RESULTS_VERSION,
    });

    // Remove sendConversions call - function doesn't exist in edge function context
    // This functionality should be handled differently in the edge function environment

    return json(origin, { ...responseBody, status: "success", session_id: sessionId });
  } catch (e: any) {
    await emitMetric("assessment.finalize.error", {
      session_id: sessionId ?? null,
      RESULTS_VERSION,
    });
    if (e instanceof FinalizeAssessmentError) {
      console.warn("assessment.finalize.validation_error", { session_id: sessionId, error: e.message });
      return json(origin, { status: "error", error: e.message }, 422);
    }
    const durationMs = typeof e === "object" && e && "__durationMs" in e ? Math.round(Number(e.__durationMs)) : undefined;
    console.error("assessment.finalize.error", {
      session_id: sessionId,
      error: e?.message || String(e),
      duration_ms: durationMs,
    });
    return json(origin, { status: "error", error: e?.message || "Internal server error" }, 500);
  }
});
