import { RESULTS_VERSION } from "./resultsVersion.ts";

export interface ProfileRow {
  id: string;
  session_id: string;
  share_token?: string;
  fc_answered_ct?: number | null;
  top_gap?: number | null;
  conf_calibrated?: number | null;
  validity_status?: string | null;
  type_code?: string | null;
  results_version?: string | null;
  version?: string | null;
  [key: string]: unknown;
}

export interface SessionRow {
  id: string;
  share_token: string | null;
  share_token_expires_at: string | null;
  completed_at: string | null;
  finalized_at: string | null;
  completed_questions: number | null;
  status: string | null;
  updated_at: string | null;
  user_id?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ScorePrismSuccess {
  status: "success";
  profile: ProfileRow;
}

export type ScorePrismResult = ScorePrismSuccess | { status: string; error?: string } | null | undefined;

export interface FinalizeAssessmentDeps {
  acquireLock(sessionId: string): Promise<() => void>;
  getProfile(sessionId: string): Promise<ProfileRow | null>;
  normalizeProfile(profile: ProfileRow): Promise<ProfileRow>;
  scoreFcSession(sessionId: string): Promise<void>;
  scorePrism(sessionId: string): Promise<ScorePrismResult>;
  getSession(sessionId: string): Promise<SessionRow | null>;
  upsertSession(sessionId: string, patch: Partial<SessionRow>): Promise<void>;
  generateShareToken(): string;
  buildResultsUrl(baseUrl: string, sessionId: string, token: string): string;
  now(): Date;
  log(payload: Record<string, unknown>): void;
}

export interface FinalizeAssessmentInput {
  sessionId: string;
  responses?: unknown;
  siteUrl: string;
}

export interface FinalizeAssessmentOutput {
  ok: true;
  profile: ProfileRow;
  share_token: string;
  results_url: string;
  results_version: string;
  path: "cache_hit" | "scored";
  session: SessionRow;
}

function toResponsesCount(responses: unknown): number | null {
  if (Array.isArray(responses)) {
    return responses.length;
  }
  return null;
}

function computeShareExpiry(now: Date): string {
  const ttlMs = 30 * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() + ttlMs).toISOString();
}

function computeCompletedQuestions(responsesCount: number | null, profile: ProfileRow): number | null {
  if (typeof responsesCount === "number") {
    return responsesCount;
  }
  const fcAnswered = profile.fc_answered_ct;
  if (typeof fcAnswered === "number" && Number.isFinite(fcAnswered)) {
    return fcAnswered;
  }
  return null;
}

function flagFcUsed(profile: ProfileRow): boolean {
  const answered = profile.fc_answered_ct;
  return typeof answered === "number" ? answered > 0 : false;
}

export class FinalizeAssessmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FinalizeAssessmentError";
  }
}

function assertSuccessfulPrism(result: ScorePrismResult, sessionId: string): ScorePrismSuccess {
  if (!result || typeof result !== "object") {
    throw new FinalizeAssessmentError(`score_prism returned invalid response for session ${sessionId}`);
  }
  if (result.status !== "success" || !("profile" in result) || !result.profile) {
    const reason = "error" in result && result.error ? result.error : "unknown";
    throw new FinalizeAssessmentError(`score_prism failed for session ${sessionId}: ${reason}`);
  }
  return result;
}

async function ensureSessionExists(session: SessionRow | null, sessionId: string): Promise<SessionRow> {
  if (!session) {
    throw new FinalizeAssessmentError(`assessment_session ${sessionId} not found`);
  }
  return session;
}

export async function finalizeAssessmentCore(
  deps: FinalizeAssessmentDeps,
  input: FinalizeAssessmentInput,
): Promise<FinalizeAssessmentOutput> {
  const { sessionId, responses, siteUrl } = input;
  const release = await deps.acquireLock(sessionId);
  try {
    const session = await deps.getSession(sessionId);
    const existingProfile = await deps.getProfile(sessionId);
    const responsesCount = toResponsesCount(responses);

    if (existingProfile) {
      const normalized = await deps.normalizeProfile(existingProfile);
      const ensuredSession = await ensureSessionExists(session, sessionId);
      const now = deps.now();
      const shareToken = ensuredSession.share_token || deps.generateShareToken();
      const shareExpiry = ensuredSession.share_token_expires_at || computeShareExpiry(now);
      const completedAt = ensuredSession.completed_at || now.toISOString();
      const finalizedAt = ensuredSession.finalized_at || completedAt;
      const completedQuestions = computeCompletedQuestions(responsesCount, normalized);

      await deps.upsertSession(sessionId, {
        share_token: shareToken,
        share_token_expires_at: shareExpiry,
        completed_at: completedAt,
        finalized_at: finalizedAt,
        completed_questions: completedQuestions,
        status: "completed",
        updated_at: now.toISOString(),
      });

      const resultsUrl = deps.buildResultsUrl(siteUrl, sessionId, shareToken);
      return {
        ok: true,
        profile: normalized,
        share_token: shareToken,
        results_url: resultsUrl,
        results_version: RESULTS_VERSION,
        path: "cache_hit",
        session: ensuredSession,
      };
    }

    // No profile exists yet — run scoring flow.
    try {
      await deps.scoreFcSession(sessionId);
    } catch (error) {
      deps.log({ evt: "finalize.fc_error", sessionId, error: error instanceof Error ? error.message : String(error) });
    }

    const prismResult = assertSuccessfulPrism(await deps.scorePrism(sessionId), sessionId);
    const normalized = await deps.normalizeProfile(prismResult.profile);
    const ensuredSession = await ensureSessionExists(await deps.getSession(sessionId), sessionId);
    const now = deps.now();
    const shareToken = ensuredSession.share_token || deps.generateShareToken();
    const shareExpiry = ensuredSession.share_token_expires_at || computeShareExpiry(now);
    const completedAt = ensuredSession.completed_at || now.toISOString();
    const finalizedAt = ensuredSession.finalized_at || completedAt;
    const completedQuestions = computeCompletedQuestions(responsesCount, normalized);

    await deps.upsertSession(sessionId, {
      share_token: shareToken,
      share_token_expires_at: shareExpiry,
      completed_at: completedAt,
      finalized_at: finalizedAt,
      completed_questions: completedQuestions,
      status: "completed",
      updated_at: now.toISOString(),
    });

    const resultsUrl = deps.buildResultsUrl(siteUrl, sessionId, shareToken);
    return {
      ok: true,
      profile: normalized,
      share_token: shareToken,
      results_url: resultsUrl,
      results_version: RESULTS_VERSION,
      path: "scored",
      session: ensuredSession,
    };
  } finally {
    release();
  }
}
