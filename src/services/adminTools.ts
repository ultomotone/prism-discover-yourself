import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SESSION_STORAGE_KEY = "prism-admin-service-role-key";

let cachedFunctionsBase: string | null = null;
let cachedServiceClient: SupabaseClient | null = null;
let cachedServiceRoleKey: string | null = null;

const viteEnv = (typeof import.meta !== "undefined" ? (import.meta as any).env : undefined) ?? {};
const nodeEnv = (typeof process !== "undefined" ? process.env : undefined) ?? {};

type JsonRecord = Record<string, unknown>;

export type RecomputeHttpResult = { ok: boolean; status: number; payload: JsonRecord };

export type BrokenSessionRow = { session_id: string };

export type CompletenessRow = { types: number; functions: number; state: number };

export type BackfillSummary = {
  requestedDays: number;
  fetched: number;
  recomputed: number;
  results: BackfillResultEntry[];
};

type BackfillResultEntry = { sessionId: string; result: RecomputeHttpResult };

const FUNCTIONS_V1_SUFFIX = "/functions/v1" as const;

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/*$/, "");
}

function normalizeFunctionsBase(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = trimTrailingSlashes(raw.trim());
  if (!trimmed) return null;

  if (trimmed.includes(".functions.supabase.co")) {
    return trimmed;
  }

  if (trimmed.endsWith(FUNCTIONS_V1_SUFFIX)) {
    const base = trimTrailingSlashes(trimmed.slice(0, -FUNCTIONS_V1_SUFFIX.length));
    if (base.includes(".supabase.co")) {
      return base.replace(".supabase.co", ".functions.supabase.co");
    }
    return `${base}${FUNCTIONS_V1_SUFFIX}`;
  }

  if (trimmed.includes(".supabase.co")) {
    return trimmed.replace(".supabase.co", ".functions.supabase.co");
  }

  return trimmed;
}

function resolveSupabaseUrl(): string {
  const explicit =
    (viteEnv.VITE_SUPABASE_URL as string | undefined) ??
    nodeEnv.VITE_SUPABASE_URL ??
    nodeEnv.NEXT_PUBLIC_SUPABASE_URL ??
    "https://gnkuikentdtnatazeriu.supabase.co";
  return explicit.trim().replace(/\/$/, "");
}

function resolveFunctionsBase(): string {
  if (cachedFunctionsBase) return cachedFunctionsBase;
  const explicitCandidates = [
    nodeEnv.NEXT_PUBLIC_SUPABASE_FUNCTION_URL,
    nodeEnv.VITE_SUPABASE_FUNCTION_URL,
    (viteEnv.VITE_SUPABASE_FUNCTION_URL as string | undefined) ?? null,
    nodeEnv.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL,
    nodeEnv.VITE_SUPABASE_FUNCTIONS_URL,
    (viteEnv.VITE_SUPABASE_FUNCTIONS_URL as string | undefined) ?? null,
  ];

  for (const candidate of explicitCandidates) {
    const normalized = normalizeFunctionsBase(candidate ?? undefined);
    if (normalized) {
      cachedFunctionsBase = normalized;
      return cachedFunctionsBase;
    }
  }

  const supabaseUrl = resolveSupabaseUrl();
  const fallback = supabaseUrl.includes(".supabase.co")
    ? supabaseUrl.replace(".supabase.co", ".functions.supabase.co")
    : `${supabaseUrl}${FUNCTIONS_V1_SUFFIX}`;

  cachedFunctionsBase = normalizeFunctionsBase(fallback) ?? fallback;
  return cachedFunctionsBase;
}

function readServiceRoleKeyFromEnv(): string | null {
  const key =
    (viteEnv.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined) ??
    nodeEnv.VITE_SUPABASE_SERVICE_ROLE_KEY ??
    nodeEnv.SUPABASE_SERVICE_ROLE_KEY ??
    null;
  if (!key) {
    return null;
  }
  const trimmed = key.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readServiceRoleKeyFromSession(): string | null {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }
  try {
    const stored = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    const trimmed = stored.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch (error) {
    console.warn("Unable to read admin service role key from session storage", error);
    return null;
  }
}

function persistServiceRoleKeyToSession(key: string | null): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }
  try {
    if (key) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, key);
    } else {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (error) {
    console.warn("Unable to persist admin service role key to session storage", error);
  }
}

function resolveServiceRoleKey(): string {
  if (cachedServiceRoleKey) {
    return cachedServiceRoleKey;
  }

  const envKey = readServiceRoleKeyFromEnv();
  if (envKey) {
    cachedServiceRoleKey = envKey;
    return cachedServiceRoleKey;
  }

  const sessionKey = readServiceRoleKeyFromSession();
  if (sessionKey) {
    cachedServiceRoleKey = sessionKey;
    return cachedServiceRoleKey;
  }

  throw new Error("Supabase service role key not configured");
}

function getServiceRoleClient(): SupabaseClient {
  if (cachedServiceClient) return cachedServiceClient;
  const client = createClient(resolveSupabaseUrl(), resolveServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  cachedServiceClient = client;
  return cachedServiceClient;
}

export function configureAdminServiceRoleKey(rawKey: string): void {
  const trimmed = rawKey.trim();
  if (!trimmed) {
    throw new Error("Service role key cannot be empty");
  }
  cachedServiceRoleKey = trimmed;
  persistServiceRoleKeyToSession(trimmed);
  cachedServiceClient = null;
}

export function clearAdminServiceRoleKey(): void {
  const envKey = readServiceRoleKeyFromEnv();
  cachedServiceRoleKey = envKey;
  persistServiceRoleKeyToSession(null);
  cachedServiceClient = null;
}

export function isAdminServiceRoleKeyConfigured(): boolean {
  if (cachedServiceRoleKey) {
    return true;
  }
  const envKey = readServiceRoleKeyFromEnv();
  if (envKey) {
    cachedServiceRoleKey = envKey;
    return true;
  }
  const sessionKey = readServiceRoleKeyFromSession();
  if (sessionKey) {
    cachedServiceRoleKey = sessionKey;
    return true;
  }
  return false;
}

function coerceCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }
  return 0;
}

function normalizeCompleteness(data: unknown): CompletenessRow {
  if (Array.isArray(data)) {
    return normalizeCompleteness(data[0] ?? null);
  }
  if (!data || typeof data !== "object") {
    return { types: 0, functions: 0, state: 0 };
  }
  const record = data as Record<string, unknown>;
  return {
    types: coerceCount(record.types),
    functions: coerceCount(record.functions),
    state: coerceCount(record.state),
  };
}

function ensurePositiveNumber(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive number`);
  }
}

async function callRecompute(sessionId: string): Promise<RecomputeHttpResult> {
  try {
    const response = await fetch(`${resolveFunctionsBase()}/recompute-scoring`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resolveServiceRoleKey()}`,
        apikey: resolveServiceRoleKey(),
      },
      body: JSON.stringify({ sessionId }),
    });
    const payload: JsonRecord = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, status: response.status, payload };
    }
    return { ok: true, status: response.status, payload };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      payload: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

async function fetchBrokenSessions(days: number, limit: number): Promise<BrokenSessionRow[]> {
  const client = getServiceRoleClient();
  const { data, error } = await client.rpc("find_broken_sessions_sql", { p_days: days, p_limit: limit });
  if (error) {
    throw new Error(error.message);
  }
  return (Array.isArray(data) ? data : []) as BrokenSessionRow[];
}

export async function recomputeSession(sessionId: string): Promise<JsonRecord> {
  const trimmed = sessionId.trim();
  if (!trimmed) {
    throw new Error("sessionId is required");
  }
  const result = await callRecompute(trimmed);
  if (!result.ok) {
    const errorMessage = typeof result.payload.error === "string" && result.payload.error.length > 0
      ? result.payload.error
      : `HTTP ${result.status}`;
    throw new Error(errorMessage);
  }
  return result.payload;
}

export async function qaSession(sessionId: string): Promise<CompletenessRow> {
  const trimmed = sessionId.trim();
  if (!trimmed) {
    throw new Error("sessionId is required");
  }
  const client = getServiceRoleClient();
  const { data, error } = await client.rpc("v2_completeness", { p_session: trimmed });
  if (error) {
    throw new Error(error.message);
  }
  return normalizeCompleteness(data);
}

export async function sampleBroken(days = 10): Promise<BrokenSessionRow[]> {
  ensurePositiveNumber(days, "days");
  const rows = await fetchBrokenSessions(days, 10);
  return rows;
}

export async function backfillBrokenSessions(opts: {
  days: number;
  batchSize: number;
}): Promise<BackfillSummary> {
  const { days, batchSize } = opts;
  ensurePositiveNumber(days, "days");
  ensurePositiveNumber(batchSize, "batchSize");

  const targets = await fetchBrokenSessions(days, 500);
  const results: BackfillResultEntry[] = [];

  for (const row of targets) {
    if (!row?.session_id) {
      continue;
    }
    const result = await callRecompute(row.session_id);
    results.push({ sessionId: row.session_id, result });
  }

  return {
    requestedDays: days,
    fetched: targets.length,
    recomputed: results.filter((entry) => entry.result.ok).length,
    results,
  };
}

export const __testing = {
  resetCaches() {
    cachedFunctionsBase = null;
    cachedServiceClient = null;
    cachedServiceRoleKey = null;
  },
  setServiceClient(client: SupabaseClient | null) {
    cachedServiceClient = client;
  },
  setCachedServiceRoleKey(key: string | null) {
    cachedServiceRoleKey = key;
  },
  callRecompute,
  normalizeCompleteness,
};
