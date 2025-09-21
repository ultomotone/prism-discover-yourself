import { buildAuthHeaders } from "@/lib/authSession";
import { buildEdgeRequestHeaders, resolveSupabaseFunctionsBase } from "@/services/supabaseEdge";

export class ResultsApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ResultsApiError";
    this.status = status;
  }
}

export type ResultsProfilePayload = Record<string, unknown> & {
  paid?: boolean;
};

export interface ResultsSuccessPayload {
  ok: true;
  results_version: string;
  scoring_version?: string;
  result_id: string;
  session: Record<string, unknown> | null;
  profile: ResultsProfilePayload;
  types: unknown[];
  functions: unknown[];
  state: unknown[];
}

export interface ResultsPendingPayload {
  ok: false;
  code: "SCORING_ROWS_MISSING";
}

export type ResultsFetchPayload = ResultsSuccessPayload | ResultsPendingPayload;

function normalizeProfile(profile: ResultsProfilePayload): ResultsProfilePayload {
  return {
    ...profile,
    paid: Boolean(profile?.paid),
  };
}

async function executeRequest(
  body: Record<string, unknown>,
  headers: HeadersInit
): Promise<ResultsFetchPayload> {
  const url = `${resolveSupabaseFunctionsBase()}/get-results-by-session`;
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      typeof payload?.error === "string" && payload.error.length > 0
        ? payload.error
        : `get-results-by-session ${response.status}`;
    throw new ResultsApiError(message, response.status);
  }

  if (payload?.ok === false && payload?.code === "SCORING_ROWS_MISSING") {
    return { ok: false, code: "SCORING_ROWS_MISSING" };
  }

  if (payload?.ok === true) {
    if (payload?.profile) {
      payload.profile = normalizeProfile(payload.profile as ResultsProfilePayload);
    }
    return payload as ResultsSuccessPayload;
  }

  const message =
    typeof payload?.error === "string" && payload.error.length > 0
      ? payload.error
      : "Unexpected results payload";
  throw new ResultsApiError(message, 500);
}

function baseHeaders(): Record<string, string> {
  return buildEdgeRequestHeaders({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
}

/** SHARE flow (no Authorization header) */
export async function fetchSharedResultBySession(
  sessionId: string,
  shareToken: string
): Promise<ResultsFetchPayload> {
  if (!sessionId) {
    throw new ResultsApiError("sessionId is required", 400);
  }
  if (!shareToken || !shareToken.trim()) {
    throw new ResultsApiError("shareToken is required", 401);
  }

  const headers = baseHeaders();
  return executeRequest(
    {
      session_id: sessionId,
      share_token: shareToken.trim(),
    },
    headers
  );
}

/** OWNER flow (Authorization required) */
export async function fetchOwnerResultBySession(
  sessionId: string
): Promise<ResultsFetchPayload> {
  if (!sessionId) {
    throw new ResultsApiError("sessionId is required", 400);
  }

  const headers = baseHeaders();
  const authHeaders = await buildAuthHeaders();
  const authorization = authHeaders.Authorization;
  if (!authorization) {
    throw new ResultsApiError("Authorization required", 401);
  }
  (headers as any).Authorization = authorization;

  return executeRequest(
    {
      session_id: sessionId,
    },
    headers
  );
}

export async function markResultsPaid(sessionId: string): Promise<void> {
  if (!sessionId) return;
  // Billing integration will be added in a follow-up. Intentionally left blank for now.
}
