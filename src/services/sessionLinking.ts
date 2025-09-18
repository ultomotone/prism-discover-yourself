let cachedFunctionsBase: string | null = null;

function resolveFunctionsBase(): string {
  if (cachedFunctionsBase) return cachedFunctionsBase;

  const envUrl =
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ??
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL
      ? `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1`
      : undefined);

  const resolved = envUrl ?? 'https://gnkuikentdtnatazeriu.supabase.co/functions/v1';

  cachedFunctionsBase = resolved;
  return cachedFunctionsBase;
}

export type EnsureSessionLinkedArgs = {
  supabase?: unknown; // retained for backwards compatibility with callers passing the client
  sessionId: string;
  userId: string;
  email?: string;
};

export async function ensureSessionLinked({
  sessionId,
  userId,
  email,
}: EnsureSessionLinkedArgs): Promise<boolean> {
  if (!sessionId || !userId) return false;

  try {
    const response = await fetch(`${resolveFunctionsBase()}/link_session_to_account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        user_id: userId,
        email: email ?? null,
      }),
    });

    if (response.status === 200 || response.status === 409) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

export async function linkSessionToAccount(
  _client: unknown,
  sessionId: string,
  userId: string,
  email?: string,
): Promise<{ ok: true } | { ok: false; error: unknown }> {
  const success = await ensureSessionLinked({ sessionId, userId, email });
  return success ? { ok: true } : { ok: false, error: new Error("link_session_to_account failed") };
}
