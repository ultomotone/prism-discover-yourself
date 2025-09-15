import { createClient as createSupabaseClient } from "@supabase/supabase-js";

type AppConfig = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_FUNCTION_URL?: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: AppConfig;
  }
}

function readConfig(): { url?: string; anon?: string } {
  const urlEnv = import.meta.env?.VITE_SUPABASE_URL as string | undefined;
  const anonEnv = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

  if (urlEnv && anonEnv) return { url: urlEnv, anon: anonEnv };

  const url = window.__APP_CONFIG__?.SUPABASE_URL;
  const anon = window.__APP_CONFIG__?.SUPABASE_ANON_KEY;

  return { url, anon };
}

export function createClient() {
  const { url, anon } = readConfig();
  if (!url || !anon) {
    throw new Error(
      "Supabase config missing. Provide SUPABASE_URL & SUPABASE_ANON_KEY, or set window.__APP_CONFIG__ in index.html."
    );
  }
  return createSupabaseClient(url, anon, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

export const supabase = createClient();

