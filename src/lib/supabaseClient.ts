import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js";
import { IS_PREVIEW } from "./env";

const viteEnv = typeof import.meta !== "undefined" ? (import.meta as any).env ?? {} : {};
const nextPublicUrl = typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_SUPABASE_URL : undefined;
const nextPublicAnon = typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined;
const fallbackUrl = "https://gnkuikentdtnatazeriu.supabase.co";
const fallbackAnon =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U";

const url = (viteEnv.VITE_SUPABASE_URL as string | undefined) ?? nextPublicUrl ?? fallbackUrl;
const anon = (viteEnv.VITE_SUPABASE_ANON_KEY as string | undefined) ?? nextPublicAnon ?? fallbackAnon;

const getStorage = (): Storage => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  const memoryStore = new Map<string, string>();
  return {
    get length() {
      return memoryStore.size;
    },
    clear: () => memoryStore.clear(),
    getItem: (key: string) => (memoryStore.has(key) ? memoryStore.get(key)! : null),
    key: (index: number) => Array.from(memoryStore.keys())[index] ?? null,
    removeItem: (key: string) => {
      memoryStore.delete(key);
    },
    setItem: (key: string, value: string) => {
      memoryStore.set(key, value);
    },
  } satisfies Storage;
};

const existing = (globalThis as any).__prism_supabase as ReturnType<typeof createClient> | undefined;

const authConfig: SupabaseClientOptions["auth"] = {
  persistSession: !IS_PREVIEW,
  autoRefreshToken: !IS_PREVIEW,
  storageKey: "prism-auth",
};

if (!IS_PREVIEW) {
  authConfig.storage = getStorage();
}

export const supabase =
  existing ??
  createClient(url, anon, {
    auth: authConfig,
  });

(globalThis as any).__prism_supabase = supabase;

export const createTrackingClient = () =>
  createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storageKey: "prism-track",
    },
  });

export default supabase;
