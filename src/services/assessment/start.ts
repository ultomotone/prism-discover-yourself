import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabaseClient";
import { sendAuditEmail } from "@/services/email-audit";

export type StartAssessmentArgs = {
  accountId: string;
};

export type AssessmentSessionRecord = {
  id: string;
  account_id: string | null;
  status: string;
  [key: string]: unknown;
};

async function insertSession(accountId: string): Promise<AssessmentSessionRecord> {
  const { data, error } = await supabase
    .from<AssessmentSessionRecord>("assessment_sessions")
    .insert({ account_id: accountId, status: "started" })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create assessment session", { cause: error ?? undefined });
  }

  return data;
}

async function buildAuthToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn("Failed to resolve auth session; falling back to anon key", error.message);
  }
  return data?.session?.access_token ?? SUPABASE_ANON_KEY;
}

export async function startAssessment({ accountId }: StartAssessmentArgs): Promise<AssessmentSessionRecord> {
  if (!accountId || !accountId.trim()) {
    throw new Error("accountId is required");
  }

  const trimmedAccountId = accountId.trim();

  await sendAuditEmail({
    subject: "Assessment start requested",
    message: `Account ${trimmedAccountId} requested a new assessment session`,
  });

  try {
    const session = await insertSession(trimmedAccountId);

    await sendAuditEmail({
      subject: "Assessment session created",
      message: `Provisioned session ${session.id} for account ${trimmedAccountId}`,
    });

    const authToken = await buildAuthToken();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/link_session_to_account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ session_id: session.id, account_id: trimmedAccountId }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`link_session_to_account failed: ${errorText || response.status}`);
    }

    await sendAuditEmail({
      subject: "Assessment started",
      message: `User ${trimmedAccountId} started session ${session.id}`,
    });

    return session;
  } catch (error) {
    await sendAuditEmail({
      subject: "Assessment start error",
      message: `Account ${trimmedAccountId} start failed: ${error instanceof Error ? error.message : String(error)}`,
    });
    throw error;
  }
}

export async function markAssessmentComplete(accountId: string, sessionId: string): Promise<void> {
  await sendAuditEmail({
    subject: "Assessment completed",
    message: `Account ${accountId} completed session ${sessionId}`,
  });
}

export async function logAssessmentError(accountId: string, sessionId: string, error: unknown): Promise<void> {
  await sendAuditEmail({
    subject: "Assessment error",
    message: `Account ${accountId} session ${sessionId} error: ${error instanceof Error ? error.message : String(error)}`,
  });
}
