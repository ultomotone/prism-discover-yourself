import type { ProfileRow, SessionRow } from "./finalizeAssessmentCore.ts";

export type CompletionEvent = "assessment.completed" | "scoring.completed";

export interface CompletionLogOptions {
  event: CompletionEvent;
  sessionId: string;
  profile: ProfileRow;
  session: SessionRow | null;
  resultsVersion: string;
  durationMs: number;
  extra?: Record<string, unknown>;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseTopTypes(topTypes: unknown): string[] {
  let source: unknown = topTypes;
  if (typeof topTypes === "string") {
    try {
      source = JSON.parse(topTypes);
    } catch (_) {
      return [];
    }
  }
  if (!Array.isArray(source)) return [];
  const codes: string[] = [];
  for (const entry of source) {
    if (typeof entry === "string" && entry) {
      codes.push(entry);
      continue;
    }
    if (entry && typeof entry === "object") {
      const candidate =
        (entry as Record<string, unknown>).code ??
        (entry as Record<string, unknown>).type_code ??
        (entry as Record<string, unknown>).typeCode ??
        (entry as Record<string, unknown>).id;
      if (typeof candidate === "string" && candidate) {
        codes.push(candidate);
      }
    }
    if (codes.length >= 3) break;
  }
  return codes.slice(0, 3);
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(4));
}

function extractMetadataValue(metadata: unknown, keys: string[]): unknown {
  if (!metadata || typeof metadata !== "object") return null;
  for (const key of keys) {
    if (key in (metadata as Record<string, unknown>)) {
      const value = (metadata as Record<string, unknown>)[key];
      if (value !== undefined) {
        return value;
      }
    }
  }
  return null;
}

function extractAttempt(profile: ProfileRow, session: SessionRow | null): number | null {
  const fromProfile = toNumber((profile as Record<string, unknown>).run_index);
  const metadata = session?.metadata ?? null;
  const fromMetadata = toNumber(
    extractMetadataValue(metadata, ["attempt_no", "attemptNo", "attempt_number", "attemptNumber", "attempt"]),
  );
  return fromMetadata ?? fromProfile ?? null;
}

function extractPaymentStatus(session: SessionRow | null): string | null {
  const metadata = session?.metadata ?? null;
  const value = extractMetadataValue(metadata, ["payment_status", "paymentStatus", "billing_status", "billingStatus"]);
  return typeof value === "string" && value ? value : null;
}

function parseFcCoverage(profile: ProfileRow): { count: number | null; coverage: number | null; used: boolean } {
  const answered = toNumber(profile.fc_answered_ct);
  const total = toNumber((profile as Record<string, unknown>).fc_count);
  const used = typeof answered === "number" ? answered > 0 : false;
  if (typeof answered === "number" && typeof total === "number" && total > 0) {
    return { count: Math.round(answered), coverage: clampRatio(answered / total), used };
  }
  if (typeof answered === "number") {
    return { count: Math.round(answered), coverage: null, used };
  }
  return { count: null, coverage: null, used };
}

function resolveConfidenceBand(profile: ProfileRow): string | null {
  const band = (profile.conf_band ?? (profile as Record<string, unknown>).confidence) as unknown;
  return typeof band === "string" && band ? band : null;
}

function resolveUserId(profile: ProfileRow, session: SessionRow | null): string | null {
  const profileUserId = (profile as Record<string, unknown>).user_id;
  if (typeof profileUserId === "string" && profileUserId) {
    return profileUserId;
  }
  const sessionUserId = session?.user_id;
  return typeof sessionUserId === "string" && sessionUserId ? sessionUserId : null;
}

export function maskSessionId(sessionId: string): string {
  const lastSix = sessionId.slice(-6);
  return lastSix.padStart(6, "*");
}

export function buildCompletionLog(options: CompletionLogOptions): Record<string, unknown> {
  const { event, sessionId, profile, session, resultsVersion, durationMs, extra } = options;
  const topTypes = parseTopTypes(profile.top_types ?? (profile as Record<string, unknown>).topTypes);
  const { count: fcItemsCount, coverage: fcCoverage, used: fcUsed } = parseFcCoverage(profile);
  const confCalibrated = toNumber(profile.conf_calibrated);
  const topGap = toNumber(profile.top_gap);
  const duration = Math.round(durationMs);
  const attemptNo = extractAttempt(profile, session);
  const paymentStatus = extractPaymentStatus(session);
  const userId = resolveUserId(profile, session);
  const validityStatus = typeof profile.validity_status === "string" ? profile.validity_status : null;
  const payload: Record<string, unknown> = {
    event,
    session_id: sessionId,
    session_id_masked: maskSessionId(sessionId),
    user_id: userId,
    RESULTS_VERSION: resultsVersion,
    fc_used: fcUsed,
    fc_items_count: fcItemsCount,
    fc_coverage: fcCoverage,
    top_types: topTypes,
    top_gap: topGap,
    conf_calibrated: confCalibrated,
    conf_band: resolveConfidenceBand(profile),
    validity_status: validityStatus,
    duration_ms: duration,
    attempt_no: attemptNo,
    payment_status: paymentStatus,
  };
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined) {
        payload[key] = value;
      }
    }
  }
  return payload;
}
