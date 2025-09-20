import "jsr:@supabase/functions-js/edge-runtime.d.ts";
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
import { emitMetric, withTimer } from "../../../lib/metrics.ts";

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(url, key);

await ensureResultsVersion(supabase);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

const json = (body: any, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

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
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  let sessionId: string | undefined;
  try {
    const body = await req.json();
    sessionId = body?.session_id;
    const responses = body?.responses;
    if (!sessionId) {
      await emitMetric("assessment.finalize.error", {
        session_id: null,
        RESULTS_VERSION,
      });
      return json({ status: "error", error: "session_id required" }, 400);
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
          buildResultsUrl: buildResultsLink,
          now: () => new Date(),
          log: (payload) => console.log(JSON.stringify(payload)),
        },
        {
          sessionId,
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

    console.log(JSON.stringify(logPayload));

    await emitMetric("assessment.finalize.success", {
      session_id: sessionId,
      RESULTS_VERSION,
    });

    return json({ ...responseBody, status: "success", session_id: sessionId });
  } catch (e: any) {
    await emitMetric("assessment.finalize.error", {
      session_id: sessionId ?? null,
      RESULTS_VERSION,
    });
    if (e instanceof FinalizeAssessmentError) {
      console.log(JSON.stringify({ event: "assessment.error", session_id: sessionId, error: e.message }));
      return json({ status: "error", error: e.message }, 422);
    }
    const durationMs = typeof e === "object" && e && "__durationMs" in e ? Math.round(Number(e.__durationMs)) : undefined;
    console.log(
      JSON.stringify({
        event: "assessment.error",
        session_id: sessionId,
        error: e?.message || String(e),
        duration_ms: durationMs,
      }),
    );
    return json({ status: "error", error: e?.message || "Internal server error" }, 500);
  }
});
