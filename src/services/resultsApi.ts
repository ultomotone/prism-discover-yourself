import supabase from "@/lib/supabaseClient";
import { buildAuthHeaders } from "@/lib/authSession";
import { IS_PREVIEW } from "@/lib/env";
import { buildEdgeRequestHeaders, resolveSupabaseFunctionsBase } from "@/services/supabaseEdge";

export class ResultsApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ResultsApiError";
    this.status = status;
  }
}

export type ResultsProfilePayload = Record<string, any> & {
  paid?: boolean;
};

export type ResultsFetchPayload = Record<string, any> & {
  profile?: ResultsProfilePayload;
};

type FetchResponse = ResultsFetchPayload & {
  ok?: boolean;
  code?: string;
  error?: string;
  profile?: ResultsProfilePayload;
  results_version?: string;
};

function normalizeProfilePayload(profile: ResultsProfilePayload): ResultsProfilePayload {
  return {
    ...profile,
    paid: Boolean(profile?.paid),
  };
}

function ensureProfile<T extends { profile?: ResultsProfilePayload }>(payload: T): T {
  if (!payload?.profile) {
    return payload;
  }

  return {
    ...payload,
    profile: normalizeProfilePayload(payload.profile),
  };
}

function buildFallback(payload: FetchResponse): FetchResponse {
  if (payload.profile) {
    return {
      results_version: payload.results_version ?? "v1",
      profile: normalizeProfilePayload(payload.profile),
    };
  }
  return payload;
}

function logFailure(sessionId: string, shareToken: string | null | undefined, status?: number) {
  console.error('results-fetch-failure', {
    sessionId,
    hasToken: Boolean(shareToken && shareToken.trim() !== ''),
    httpStatus: status ?? null,
  });
}

export async function fetchResultsBySession(
  sessionId: string,
  shareToken?: string | null
): Promise<ResultsFetchPayload> {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }

  const normalizedToken = shareToken?.trim() ?? "";

  const url = `${resolveSupabaseFunctionsBase()}/get-results-by-session`;
  const headers = buildEdgeRequestHeaders({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });

  const body: Record<string, unknown> = {
    session_id: sessionId,
  };

  if (normalizedToken) {
    body.share_token = normalizedToken;
  }

  if (!IS_PREVIEW) {
    const authHeaders = await buildAuthHeaders();
    if (authHeaders.Authorization) {
      headers.Authorization = authHeaders.Authorization;
    }
  }

  if (!normalizedToken && !headers.Authorization) {
    logFailure(sessionId, shareToken ?? null, 401);
    throw new ResultsApiError("Authorization required", 401);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const payload: FetchResponse = ensureProfile(await response.json().catch(() => ({})));

    if (!response.ok) {
      if (payload.profile) {
        return buildFallback(payload);
      }

      const message =
        typeof payload.error === "string" && payload.error.length > 0
          ? payload.error
          : `get-results-by-session ${response.status}`;
      logFailure(sessionId, shareToken ?? null, response.status);
      throw new ResultsApiError(message, response.status);
    }

    if (payload.ok === false) {
      if (payload.code === "SCORING_ROWS_MISSING" && payload.profile) {
        return buildFallback(payload);
      }
      return payload;
    }

    if (!payload.ok && payload.profile && !payload.types) {
      return buildFallback(payload);
    }

    return payload;
  } catch (error) {
    if (error instanceof ResultsApiError) {
      throw error;
    }
    if (error instanceof Error) {
      logFailure(sessionId, shareToken ?? null, (error as ResultsApiError).status);
      throw error;
    }
    logFailure(sessionId, shareToken ?? null, undefined);
    throw new ResultsApiError("Failed to fetch results");
  }
}

export async function markResultsPaid(sessionId: string): Promise<void> {
  if (!sessionId) return;
  // Billing integration will be added in a follow-up. Intentionally left blank for now.
}
