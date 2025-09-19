import supabase from "@/lib/supabaseClient";
import { IS_PREVIEW } from "@/lib/env";

let cachedFunctionsBase: string | null = null;

function resolveFunctionsBase(): string {
  if (cachedFunctionsBase) return cachedFunctionsBase;

  const envUrl =
    (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL : undefined) ??
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL
      ? `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1`
      : undefined);

  const resolved = envUrl ?? "https://gnkuikentdtnatazeriu.supabase.co/functions/v1";

  cachedFunctionsBase = resolved;
  return cachedFunctionsBase;
}

export type EnsureSessionLinkedArgs = {
  supabase?: unknown;
  sessionId: string;
  userId: string;
  email?: string;
};

export type LinkResult = { ok: true } | { ok: false; code?: string; error?: unknown };

async function invokeLink(body: Record<string, unknown>): Promise<Response> {
  return fetch(`${resolveFunctionsBase()}/link_session_to_account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function linkWithSupabaseAuth(sessionId: string, email?: string): Promise<LinkResult> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData?.user;
    if (!authUser?.id) {
      return { ok: false, code: "NO_AUTH" };
    }

    const { data, error } = await supabase.functions.invoke("link_session_to_account", {
      body: { session_id: sessionId, user_id: authUser.id, email: email ?? authUser.email ?? null },
    });

    if (error) {
      const status = (error as any)?.status ?? (error as any)?.code;
      if (status === 409 || status === "409") {
        return { ok: true };
      }
      return { ok: false, error };
    }

    if (data?.success || data?.code === "ALREADY_LINKED" || data?.note === "already linked") {
      return { ok: true };
    }

    if (data?.status === 409 || data?.code === 409) {
      return { ok: true };
    }

    if (data?.error) {
      return { ok: false, code: data.code, error: data.error };
    }

    if (data?.success === false) {
      return { ok: false, code: data.code, error: data.error };
    }

    return data?.success ? { ok: true } : { ok: false };
  } catch (error) {
    const message = String(error ?? "");
    if (message.includes("409")) {
      return { ok: true };
    }
    return { ok: false, error };
  }
}

function isConflictStatus(status: number | string | undefined): boolean {
  if (typeof status === "number") return status === 409;
  if (typeof status === "string") return status === "409";
  return false;
}

export async function linkSessionToAccount(
  _client: unknown,
  sessionId: string,
  userId: string,
  email?: string
): Promise<LinkResult> {
  if (IS_PREVIEW) {
    return { ok: true };
  }

  if (!sessionId || !userId) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  const viaAuth = await linkWithSupabaseAuth(sessionId, email);
  if (viaAuth.ok) {
    return viaAuth;
  }

  try {
    const response = await invokeLink({
      session_id: sessionId,
      user_id: userId,
      email: email ?? null,
    });

    if (response.status === 200 || response.status === 204 || response.status === 409) {
      return { ok: true };
    }

    const payload = await response.json().catch(() => null);
    if (isConflictStatus(payload?.status) || isConflictStatus(payload?.code)) {
      return { ok: true };
    }

    return { ok: false, code: payload?.code, error: payload?.error };
  } catch (error) {
    const message = String(error ?? "");
    if (message.includes("409")) {
      return { ok: true };
    }
    return { ok: false, error };
  }
}

export async function ensureSessionLinked({
  sessionId,
  userId,
  email,
}: EnsureSessionLinkedArgs): Promise<boolean> {
  if (IS_PREVIEW) {
    return true;
  }

  if (!sessionId || !userId) {
    return false;
  }

  const result = await linkSessionToAccount(null, sessionId, userId, email);
  return result.ok;
}
