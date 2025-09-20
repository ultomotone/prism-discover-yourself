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

export type ResultsFetchPayload = Record<string, any>;

type FetchResponse = ResultsFetchPayload & {
  ok?: boolean;
  code?: string;
  error?: string;
  profile?: ResultsFetchPayload;
  results_version?: string;
};

function buildFallback(payload: FetchResponse): FetchResponse {
  if (payload.profile) {
    return {
      results_version: payload.results_version ?? "v1",
      profile: payload.profile,
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
  shareToken: string
): Promise<ResultsFetchPayload> {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }

  if (!shareToken || shareToken.trim() === "") {
    logFailure(sessionId, shareToken, 401);
    throw new ResultsApiError("Secure share token required", 401);
  }

  const url = `${resolveSupabaseFunctionsBase()}/get-results-by-session`;
  const headers = buildEdgeRequestHeaders({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });

  const body: Record<string, unknown> = {
    session_id: sessionId,
    share_token: shareToken,
  };

  if (!IS_PREVIEW) {
    const authHeaders = await buildAuthHeaders();
    if (authHeaders.Authorization) {
      headers.Authorization = authHeaders.Authorization;
    }
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const payload: FetchResponse = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (payload.profile) {
        return buildFallback(payload);
      }

      const message =
        typeof payload.error === "string" && payload.error.length > 0
          ? payload.error
          : `get-results-by-session ${response.status}`;
      logFailure(sessionId, shareToken, response.status);
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
      logFailure(sessionId, shareToken, (error as ResultsApiError).status);
      throw error;
    }
    logFailure(sessionId, shareToken, undefined);
    throw new ResultsApiError("Failed to fetch results");
  }
}
