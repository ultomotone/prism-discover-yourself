import supabase from "@/lib/supabaseClient";

export async function getCurrentAccessToken(): Promise<string | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    return sessionData?.session?.access_token ?? null;
  } catch (error) {
    console.warn("Failed to load Supabase session", error);
    return null;
  }
}

export async function buildAuthHeaders(): Promise<Record<string, string>> {
  const token = await getCurrentAccessToken();
  if (!token) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}
