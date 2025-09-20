import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabaseClient";

const viteEnv = (typeof import.meta !== "undefined" ? ((import.meta as any).env ?? {}) : {}) as Record<string, unknown>;
const nodeEnv = (typeof process !== "undefined" ? process.env ?? {} : {}) as Record<string, string | undefined>;

let cachedFunctionsBase: string | null = null;

function normalizeBaseUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.endsWith("/functions/v1")) {
    return trimmed;
  }
  return `${trimmed.replace(/\/$/, "")}/functions/v1`;
}

function resolveEnvFunctionsUrl(): string | null {
  const explicit =
    nodeEnv.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ??
    nodeEnv.VITE_SUPABASE_FUNCTIONS_URL ??
    (viteEnv.VITE_SUPABASE_FUNCTIONS_URL as string | undefined) ??
    null;
  return normalizeBaseUrl(explicit);
}

export function resolveSupabaseFunctionsBase(): string {
  if (cachedFunctionsBase) return cachedFunctionsBase;

  const fromEnv = resolveEnvFunctionsUrl();
  if (fromEnv) {
    cachedFunctionsBase = fromEnv;
    return cachedFunctionsBase;
  }

  const fallback = `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1`;
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
