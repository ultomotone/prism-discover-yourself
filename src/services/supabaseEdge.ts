import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabaseClient";

const viteEnv = (typeof import.meta !== "undefined" ? ((import.meta as any).env ?? {}) : {}) as Record<string, unknown>;
const nodeEnv = (typeof process !== "undefined" ? process.env ?? {} : {}) as Record<string, string | undefined>;

let cachedFunctionsBase: string | null = null;

const FUNCTIONS_V1_SUFFIX = "/functions/v1" as const;

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/*$/, "");
}

function normalizeFunctionsBase(raw: string | null | undefined): string | null {
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

function resolveEnvFunctionsUrl(): string | null {
  const explicitCandidates = [
    nodeEnv.NEXT_PUBLIC_SUPABASE_FUNCTION_URL,
    nodeEnv.VITE_SUPABASE_FUNCTION_URL,
    (viteEnv.VITE_SUPABASE_FUNCTION_URL as string | undefined) ?? null,
    nodeEnv.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL,
    nodeEnv.VITE_SUPABASE_FUNCTIONS_URL,
    (viteEnv.VITE_SUPABASE_FUNCTIONS_URL as string | undefined) ?? null,
  ];

  for (const candidate of explicitCandidates) {
    const normalized = normalizeFunctionsBase(candidate ?? null);
    if (normalized) return normalized;
  }

  return null;
}

function deriveFromSupabaseUrl(): string {
  const base = trimTrailingSlashes(SUPABASE_URL);
  if (base.includes(".supabase.co")) {
    return base.replace(".supabase.co", ".functions.supabase.co");
  }
  return `${base}${FUNCTIONS_V1_SUFFIX}`;
}

export function resolveSupabaseFunctionsBase(): string {
  if (cachedFunctionsBase) return cachedFunctionsBase;

  const fromEnv = resolveEnvFunctionsUrl();
  if (fromEnv) {
    cachedFunctionsBase = fromEnv;
    return cachedFunctionsBase;
  }

  const fallback = normalizeFunctionsBase(deriveFromSupabaseUrl()) ?? deriveFromSupabaseUrl();
  cachedFunctionsBase = fallback;
  return cachedFunctionsBase;
}

export function buildEdgeRequestHeaders(
  overrides?: Record<string, string | undefined>
): Record<string, string> {
  const base: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    "x-client-info": "prism-web-edge",
  };

  if (!overrides) {
    return base;
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    base[key] = value;
  }

  return base;
}
