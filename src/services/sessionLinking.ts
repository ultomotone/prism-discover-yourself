import type { User } from "@supabase/supabase-js";

import { buildAuthHeaders } from "@/lib/authSession";
import supabase from "@/lib/supabaseClient";
import { IS_PREVIEW } from "@/lib/env";
import { buildEdgeRequestHeaders, resolveSupabaseFunctionsBase } from "@/services/supabaseEdge";

export type EnsureSessionLinkedArgs = {
  supabase?: unknown;
  sessionId: string;
  userId: string;
  email?: string;
};

export type LinkResult = { ok: true } | { ok: false; code?: string; error?: unknown };

async function invokeLink(
  body: Record<string, unknown>,
  authHeaders: Record<string, string>
): Promise<Response> {
  const headers = buildEdgeRequestHeaders({
    "Content-Type": "application/json",
  });

  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  return fetch(`${resolveSupabaseFunctionsBase()}/link_session_to_account`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

async function linkWithSupabaseAuth(
  sessionId: string,
  authUser: User,
  email: string | undefined,
  authHeaders: Record<string, string>
): Promise<LinkResult> {
  try {
    const { data, error } = await supabase.functions.invoke("link_session_to_account", {
      body: { session_id: sessionId, user_id: authUser.id, email: email ?? authUser.email ?? null },
      headers: {
        ...authHeaders,
      },
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

  const { data: authData } = await supabase.auth.getUser();
  const authUser = authData?.user;
  if (!authUser?.id) {
    return { ok: false, code: "NO_AUTH" };
  }

  if (authUser.id !== userId) {
    return { ok: false, code: "USER_MISMATCH" };
  }

  const authHeaders = await buildAuthHeaders();
  if (!authHeaders.Authorization) {
    return { ok: false, code: "NO_AUTH" };
  }

  const viaAuth = await linkWithSupabaseAuth(sessionId, authUser, email, authHeaders);
  if (viaAuth.ok) {
    return viaAuth;
  }

  try {
    const response = await invokeLink({
      session_id: sessionId,
      user_id: userId,
      email: email ?? null,
    }, authHeaders);

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
