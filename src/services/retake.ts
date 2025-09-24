import {
  buildEdgeRequestHeaders,
  resolveSupabaseFunctionsBase,
} from "@/services/supabaseEdge";

export interface CheckRetakeAllowanceParams {
  userId?: string;
  email?: string;
  maxPerWindow: number;
  windowDays: number;
}

export interface RetakeAllowanceResult {
  allowed: boolean;
  attemptNo?: number;
  nextEligibleDate?: string | null;
}

export class RetakeAllowanceError extends Error {
  status?: number;
  attemptNo?: number;
  nextEligibleDate?: string | null;

  constructor(
    message: string,
    options: { status?: number; attemptNo?: number; nextEligibleDate?: string | null } = {},
  ) {
    super(message);
    this.name = "RetakeAllowanceError";
    this.status = options.status;
    this.attemptNo = options.attemptNo;
    this.nextEligibleDate = options.nextEligibleDate ?? null;
  }
}

function normalizeAttempt(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.max(1, Math.trunc(raw));
  }
  if (typeof raw === "string") {
    const numeric = Number.parseInt(raw, 10);
    if (Number.isFinite(numeric)) {
      return Math.max(1, numeric);
    }
  }
  return undefined;
}

function normalizeDate(raw: unknown): string | null {
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw;
  }
  return null;
}

export async function checkRetakeAllowance({
  userId,
  email,
  maxPerWindow,
  windowDays,
}: CheckRetakeAllowanceParams): Promise<RetakeAllowanceResult> {
  const allowByDefault = (reason: string): RetakeAllowanceResult => {
    console.warn(
      "[retake] proceeding without allowance guard:",
      reason,
    );
    return { allowed: true, attemptNo: undefined, nextEligibleDate: null };
  };

  const baseUrl = resolveSupabaseFunctionsBase();
  const url = `${baseUrl}/can_start_new_session`;
  const headers = buildEdgeRequestHeaders({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });

  const payload: Record<string, unknown> = {
    max_per_window: Math.max(1, Math.trunc(maxPerWindow)),
    window_days: Math.max(1, Math.trunc(windowDays)),
  };

  const trimmedUserId = typeof userId === "string" ? userId.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim() : "";

  if (trimmedUserId) {
    payload.user_id = trimmedUserId;
  }
  if (trimmedEmail) {
    payload.email = trimmedEmail.toLowerCase();
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to reach can_start_new_session";
    return allowByDefault(message);
  }

  let json: any = null;
  try {
    json = await response.json();
  } catch (error) {
    if (response.ok) {
      return allowByDefault("invalid allowance payload");
    }
  }

  const attemptNo = normalizeAttempt(json?.attempt_no ?? json?.attemptNo);
  const nextEligibleDate = normalizeDate(json?.next_eligible_date ?? json?.nextEligibleDate);

  if (!response.ok) {
    if (response.status === 404 || response.status === 401) {
      return allowByDefault(`edge function unavailable (${response.status})`);
    }
    const message =
      typeof json?.error === "string" && json.error.trim().length > 0
        ? json.error
        : `can_start_new_session ${response.status}`;
    throw new RetakeAllowanceError(message, {
      status: response.status,
      attemptNo,
      nextEligibleDate,
    });
  }

  const allowed = Boolean(json?.allowed);

  return {
    allowed,
    attemptNo,
    nextEligibleDate,
  };
}
