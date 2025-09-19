import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedFunctionsBase: string | null = null;
let cachedServiceClient: SupabaseClient | null = null;

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

function normalizeBaseUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.endsWith("/functions/v1")) {
    return trimmed;
  }
  return `${trimmed.replace(/\/$/, "")}/functions/v1`;
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
  const explicit =
    nodeEnv.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ??
    nodeEnv.VITE_SUPABASE_FUNCTIONS_URL ??
    (viteEnv.VITE_SUPABASE_FUNCTIONS_URL as string | undefined) ??
    null;
  const resolved = normalizeBaseUrl(explicit ?? undefined) ?? `${resolveSupabaseUrl()}/functions/v1`;
  cachedFunctionsBase = resolved;
  return cachedFunctionsBase;
}

function resolveServiceRoleKey(): string {
  const key =
    (viteEnv.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined) ??
    nodeEnv.VITE_SUPABASE_SERVICE_ROLE_KEY ??
    nodeEnv.SUPABASE_SERVICE_ROLE_KEY ??
    null;
  if (!key) {
    throw new Error("Supabase service role key not configured");
  }
  return key;
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
  },
  setServiceClient(client: SupabaseClient | null) {
    cachedServiceClient = client;
  },
  callRecompute,
  normalizeCompleteness,
};
