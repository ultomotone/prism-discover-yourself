import supabase from "@/lib/supabaseClient";

let cachedFunctionsBase: string | null = null;

function normalizeBaseUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.endsWith("/functions/v1")) {
    return trimmed;
  }
  return `${trimmed.replace(/\/$/, "")}/functions/v1`;
}

function resolveFunctionsBase(): string {
  if (cachedFunctionsBase) return cachedFunctionsBase;

  const viteEnv = (typeof import.meta !== "undefined" ? (import.meta as any).env : undefined) ?? {};
  const nodeEnv = (typeof process !== "undefined" ? process.env : undefined) ?? {};

  const explicit =
    nodeEnv.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ??
    nodeEnv.VITE_SUPABASE_FUNCTIONS_URL ??
    viteEnv.VITE_SUPABASE_FUNCTIONS_URL ??
    null;

  const resolved =
    normalizeBaseUrl(explicit ?? undefined) ??
    normalizeBaseUrl(viteEnv.VITE_SUPABASE_URL ?? nodeEnv.VITE_SUPABASE_URL ?? nodeEnv.NEXT_PUBLIC_SUPABASE_URL) ??
    "https://gnkuikentdtnatazeriu.supabase.co/functions/v1";

  cachedFunctionsBase = resolved;
  return cachedFunctionsBase;
}

async function resolveJwt(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    const jwt = data?.session?.access_token;
    return jwt ?? null;
  } catch (error) {
    console.warn("Failed to resolve Supabase session", error);
    return null;
  }
}

const anonKey = (() => {
  const viteEnv = (typeof import.meta !== "undefined" ? (import.meta as any).env : undefined) ?? {};
  const nodeEnv = (typeof process !== "undefined" ? process.env : undefined) ?? {};
  return (
    viteEnv.VITE_SUPABASE_ANON_KEY ??
    nodeEnv.VITE_SUPABASE_ANON_KEY ??
    nodeEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    null
  );
})();

type JsonRecord = Record<string, unknown>;

async function post(name: string, body: JsonRecord, withJwt = true): Promise<JsonRecord> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (anonKey) {
    headers.apikey = String(anonKey);
  }
  if (withJwt) {
    const jwt = await resolveJwt();
    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    }
  }

  const response = await fetch(`${resolveFunctionsBase()}/${name}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body ?? {}),
  });

  const payload: JsonRecord = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload.error === "string" && payload.error.length > 0
        ? payload.error
        : `HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

export async function recomputeSession(sessionId: string): Promise<JsonRecord> {
  const trimmed = sessionId.trim();
  if (!trimmed) {
    throw new Error("sessionId is required");
  }
  return post("score_prism", { session_id: trimmed });
}

export async function qaSession(sessionId: string): Promise<JsonRecord> {
  const trimmed = sessionId.trim();
  if (!trimmed) {
    throw new Error("sessionId is required");
  }
  return post("check_scoring_qa", { session_id: trimmed });
}

export async function sampleBroken(limit = 20): Promise<JsonRecord> {
  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error("limit must be a positive number");
  }
  return post("find_broken_sessions", { limit });
}

export async function backfillBrokenSessions(opts: {
  days: number;
  batchSize: number;
}): Promise<JsonRecord> {
  const { days, batchSize } = opts;
  if (!Number.isFinite(days) || days <= 0) {
    throw new Error("days must be a positive number");
  }
  if (!Number.isFinite(batchSize) || batchSize <= 0) {
    throw new Error("batchSize must be a positive number");
  }
  return post("backfill_broken_sessions", { days, batchSize });
}

