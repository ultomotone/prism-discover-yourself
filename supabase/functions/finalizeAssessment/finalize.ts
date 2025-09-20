import { buildResultsLink } from "../_shared/results-link.ts";
import { RESULTS_VERSION } from "../_shared/resultsVersion.ts";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface SupabaseClientLike {
  from(table: string): {
    select(columns: string): any;
    eq(column: string, value: string): any;
    maybeSingle(): Promise<{ data: any; error: { message?: string } | null }>;
    upsert(values: Record<string, unknown>, options?: { onConflict?: string }): Promise<{ error: { message?: string } | null }>;
    update(values: Record<string, unknown>): { eq(column: string, value: string): Promise<{ error: { message?: string } | null }> };
  };
  functions: {
    invoke(name: string, args: { body: Record<string, unknown> }): Promise<{ data: any; error: { message?: string } | null }>;
  };
}

export interface FinalizeAssessmentDeps {
  supabase: SupabaseClientLike;
  sessionId: string;
  responses?: unknown;
  siteUrl: string;
  now: () => Date;
  logger: (payload: Record<string, JsonValue>) => void;
}

export interface FinalizeAssessmentResult {
  ok: true;
  status: "success";
  session_id: string;
  share_token: string;
  results_url: string;
  results_version: string;
  profile: Record<string, JsonValue>;
}

interface Deferred {
  promise: Promise<void>;
  resolve: () => void;
}

const sessionLocks = new Map<string, Deferred>();

function createDeferred(): Deferred {
  let resolve!: () => void;
  const promise = new Promise<void>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

async function withSessionLock<T>(sessionId: string, fn: () => Promise<T>): Promise<T> {
  for (;;) {
    const existing = sessionLocks.get(sessionId);
    if (!existing) {
      const deferred = createDeferred();
      sessionLocks.set(sessionId, deferred);
      try {
        return await fn();
      } finally {
        sessionLocks.delete(sessionId);
        deferred.resolve();
      }
    }
    await existing.promise;
  }
}

function computeCompletedCount(responses: unknown, profile: Record<string, any> | null, fallback: number | null): number | null {
  if (Array.isArray(responses)) {
    return responses.length;
  }

  if (typeof fallback === "number") {
    return fallback;
  }

  if (profile) {
    if (typeof profile.completed_questions === "number") {
      return profile.completed_questions;
    }
    if (typeof profile.fc_answered_ct === "number") {
      return profile.fc_answered_ct;
    }
  }

  return null;
}

function computeTopGap(profile: Record<string, any> | null): number | null {
  const fits = (profile?.top_3_fits ?? []) as Array<{ fit?: number }>;
  if (!Array.isArray(fits) || fits.length === 0) {
    return null;
  }
  const [first, second] = fits;
  if (typeof first?.fit !== "number") {
    return null;
  }
  const secondFit = typeof second?.fit === "number" ? second.fit : 0;
  return Number((first.fit - secondFit).toFixed(6));
}

function computeFcUsed(profile: Record<string, any> | null): boolean {
  if (!profile) return false;
  if (typeof profile.fc_answered_ct === "number") {
    return profile.fc_answered_ct > 0;
  }
  if (profile.fc_scores && typeof profile.fc_scores === "object") {
    return Object.keys(profile.fc_scores).length > 0;
  }
  return false;
}

async function fetchProfile(client: SupabaseClientLike, sessionId: string): Promise<Record<string, any> | null> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message ?? "unknown error"}`);
  }

  return data ?? null;
}

async function ensureProfileVersion(
  client: SupabaseClientLike,
  profile: Record<string, any>,
  sessionId: string,
): Promise<Record<string, any>> {
  const payload = {
    ...profile,
    session_id: profile.session_id ?? sessionId,
    results_version: RESULTS_VERSION,
    version: RESULTS_VERSION,
  };

  const { error } = await client
    .from("profiles")
    .upsert(payload, { onConflict: "session_id" });

  if (error) {
    throw new Error(`Failed to stamp profile version: ${error.message ?? "unknown error"}`);
  }

  return payload;
}

async function fetchSession(
  client: SupabaseClientLike,
  sessionId: string,
): Promise<Record<string, any> | null> {
  const { data, error } = await client
    .from("assessment_sessions")
    .select("id, share_token, share_token_expires_at, completed_at, finalized_at, completed_questions, status, profile_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load session: ${error.message ?? "unknown error"}`);
  }

  return data ?? null;
}

function ensureShareToken(existingToken?: string): string {
  return existingToken || crypto.randomUUID();
}

function ensureTokenExpiry(existingExpiry?: string | null, now: Date): string {
  if (existingExpiry) {
    return existingExpiry;
  }
  const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return expiry.toISOString();
}

async function upsertSession(
  client: SupabaseClientLike,
  sessionId: string,
  session: Record<string, any> | null,
  updates: Record<string, unknown>,
  nowIso: string,
): Promise<void> {
  const payload = {
    id: sessionId,
    status: "completed",
    completed_at: session?.completed_at ?? updates.completed_at ?? null,
    finalized_at: session?.finalized_at ?? updates.finalized_at ?? null,
    ...updates,
  };

  if (!payload.completed_at) {
    payload.completed_at = updates.completed_at ?? nowIso;
  }
  if (!payload.finalized_at) {
    payload.finalized_at = updates.finalized_at ?? payload.completed_at;
  }

  const { error } = await client
    .from("assessment_sessions")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    throw new Error(`Failed to update session: ${error.message ?? "unknown error"}`);
  }
}

function normaliseProfileForResponse(profile: Record<string, any>, sessionId: string): Record<string, JsonValue> {
  return {
    ...profile,
    session_id: profile.session_id ?? sessionId,
    results_version: RESULTS_VERSION,
    version: RESULTS_VERSION,
  };
}

function logCompletion(
  logger: (payload: Record<string, JsonValue>) => void,
  event: "finalize_scored" | "finalize_return_existing",
  sessionId: string,
  profile: Record<string, any> | null,
) {
  logger({
    evt: event,
    sessionId,
    RESULTS_VERSION,
    fc_used: computeFcUsed(profile),
    top_type: profile?.type_code ?? null,
    top_gap: computeTopGap(profile),
    conf_calibrated: typeof profile?.conf_calibrated === "number" ? Number(profile.conf_calibrated.toFixed(4)) : null,
    validity_status:
      (profile?.validity_status as JsonValue | undefined) ??
      ((profile?.meta as Record<string, any> | undefined)?.validity?.status as JsonValue | undefined) ??
      null,
  });
}

export async function finalizeAssessment(deps: FinalizeAssessmentDeps): Promise<FinalizeAssessmentResult> {
  const { supabase, sessionId, responses, siteUrl, now, logger } = deps;

  return withSessionLock(sessionId, async () => {
    logger({ evt: "finalize_start", sessionId });

    const sessionRow = await fetchSession(supabase, sessionId);
    const existingProfile = await fetchProfile(supabase, sessionId);

    const currentNow = now();
    const completedAtIso = currentNow.toISOString();

    if (existingProfile) {
      const stampedProfile = await ensureProfileVersion(supabase, existingProfile, sessionId);
      const shareToken = ensureShareToken(sessionRow?.share_token);
      const shareTokenExpiresAt = ensureTokenExpiry(sessionRow?.share_token_expires_at, currentNow);

      const completedQuestions = computeCompletedCount(responses, stampedProfile, sessionRow?.completed_questions ?? null);

      await upsertSession(
        supabase,
        sessionId,
        sessionRow,
        {
          share_token: shareToken,
          share_token_expires_at: shareTokenExpiresAt,
          profile_id: stampedProfile.id ?? sessionRow?.profile_id ?? null,
          completed_at: sessionRow?.completed_at ?? completedAtIso,
          finalized_at: sessionRow?.finalized_at ?? completedAtIso,
          completed_questions: completedQuestions ?? sessionRow?.completed_questions ?? null,
        },
        completedAtIso,
      );

      const resultsUrl = buildResultsLink(siteUrl, sessionId, shareToken);

      logCompletion(logger, "finalize_return_existing", sessionId, stampedProfile);

      return {
        ok: true,
        status: "success",
        session_id: sessionId,
        share_token: shareToken,
        results_url: resultsUrl,
        results_version: RESULTS_VERSION,
        profile: normaliseProfileForResponse(stampedProfile, sessionId),
      };
    }

    try {
      const fcResponse = await supabase.functions.invoke("score_fc_session", {
        body: { session_id: sessionId, version: "v1.2", basis: "functions" },
      });
      if (fcResponse.error) {
        logger({ evt: "finalize_fc_missing", sessionId, error: fcResponse.error.message ?? "unknown" });
      } else {
        logger({ evt: "finalize_fc_invoked", sessionId });
      }
    } catch (error: any) {
      logger({ evt: "finalize_fc_missing", sessionId, error: error?.message ?? String(error) });
    }

    const { data: prismData, error: prismError } = await supabase.functions.invoke("score_prism", {
      body: { session_id: sessionId },
    });

    if (prismError) {
      throw new Error(prismError.message ?? "score_prism failed");
    }

    if (!prismData || prismData.status !== "success" || !prismData.profile) {
      const errorMessage =
        (prismData && (prismData.error as string | undefined)) ||
        "score_prism did not return a profile";
      throw new Error(errorMessage);
    }

    const scoredProfile = await ensureProfileVersion(supabase, {
      ...prismData.profile,
      session_id: prismData.profile.session_id ?? sessionId,
      results_version: prismData.profile.results_version ?? RESULTS_VERSION,
      version: prismData.profile.version ?? RESULTS_VERSION,
    }, sessionId);

    const shareToken = ensureShareToken(sessionRow?.share_token);
    const shareTokenExpiresAt = ensureTokenExpiry(sessionRow?.share_token_expires_at, currentNow);
    const completedQuestions = computeCompletedCount(responses, scoredProfile, sessionRow?.completed_questions ?? null);

    await upsertSession(
      supabase,
      sessionId,
      sessionRow,
      {
        share_token: shareToken,
        share_token_expires_at: shareTokenExpiresAt,
        profile_id: scoredProfile.id ?? sessionRow?.profile_id ?? null,
        completed_at: sessionRow?.completed_at ?? completedAtIso,
        finalized_at: sessionRow?.finalized_at ?? completedAtIso,
        completed_questions: completedQuestions ?? sessionRow?.completed_questions ?? null,
      },
      completedAtIso,
    );

    const resultsUrl = buildResultsLink(siteUrl, sessionId, shareToken);

    logCompletion(logger, "finalize_scored", sessionId, scoredProfile);

    return {
      ok: true,
      status: "success",
      session_id: sessionId,
      share_token: shareToken,
      results_url: resultsUrl,
      results_version: RESULTS_VERSION,
      profile: normaliseProfileForResponse(scoredProfile, sessionId),
    };
  });
}

