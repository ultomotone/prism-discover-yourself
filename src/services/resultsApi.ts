import { supabase } from "@/lib/supabaseClient";

let cachedFunctionsBase: string | null = null;

function resolveFunctionsBase(): string {
  if (cachedFunctionsBase) return cachedFunctionsBase;

  const envUrl =
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ??
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL
      ? `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1`
      : undefined);

  const resolved = envUrl ?? 'https://gnkuikentdtnatazeriu.supabase.co/functions/v1';

  cachedFunctionsBase = resolved;
  return cachedFunctionsBase;
}

export type ResultsFetchPayload = Record<string, any>;

export async function fetchResultsBySession(
  sessionId: string,
  shareToken?: string | null
): Promise<ResultsFetchPayload> {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }

  const url = `${resolveFunctionsBase()}/get-results-by-session`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const body: Record<string, unknown> = { session_id: sessionId };

  if (shareToken) {
    body.share_token = shareToken;
  } else {
    const { data } = await supabase.auth.getSession();
    const jwt = data?.session?.access_token;
    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    }
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || (payload && typeof payload === "object" && payload.ok === false)) {
    const message =
      (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : null) ?? `get-results-by-session ${response.status}`;
    throw new Error(message);
  }

  return payload as ResultsFetchPayload;
}
