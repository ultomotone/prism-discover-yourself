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
  // 1) Preferred: Vite envs (for hosts that support them)
  const urlEnv = import.meta.env?.VITE_SUPABASE_URL as string | undefined;
  const anonEnv = import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (urlEnv && anonEnv) return { url: urlEnv, anon: anonEnv };

  // 2) Lovable fallback: runtime config injected in index.html
  const url = window.__APP_CONFIG__?.SUPABASE_URL;
  const anon = window.__APP_CONFIG__?.SUPABASE_ANON_KEY;

  return { url, anon };
}

const { url, anon } = readConfig();

if (!url || !anon) {
  throw new Error(
    "Supabase config missing. Provide VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY, or set window.__APP_CONFIG__ in index.html."
  );
}

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
});

