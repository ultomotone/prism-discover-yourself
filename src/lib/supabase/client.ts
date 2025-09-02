import { createClient } from "@supabase/supabase-js";

type AppConfig = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: AppConfig;
  }
}

function readConfig(): { url?: string; anon?: string } {
  // 1) Preferred: standard env vars (works in Supabase and Node hosts)
  const urlEnv =
    (typeof process !== "undefined" && process.env.SUPABASE_URL) ||
    (import.meta.env && (import.meta.env as any).SUPABASE_URL);
  const anonEnv =
    (typeof process !== "undefined" && process.env.SUPABASE_ANON_KEY) ||
    (import.meta.env && (import.meta.env as any).SUPABASE_ANON_KEY);

  if (urlEnv && anonEnv) return { url: urlEnv, anon: anonEnv };

  // 2) Lovable fallback: runtime config injected in index.html
  const url = window.__APP_CONFIG__?.SUPABASE_URL;
  const anon = window.__APP_CONFIG__?.SUPABASE_ANON_KEY;

  return { url, anon };
}

const { url, anon } = readConfig();

if (!url || !anon) {
  throw new Error(
    "Supabase config missing. Set SUPABASE_URL & SUPABASE_ANON_KEY env vars or inject window.__APP_CONFIG__."
  );
}

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
});

