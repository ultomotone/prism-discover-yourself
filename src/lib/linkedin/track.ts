/**
 * QA steps:
 * 1. In browser console: liTest('<CONVERSION_ID>', '[email protected]')
 * 2. Expect network 200 from /functions/v1/linkedin-capi, response { ok: true, eventId }
 * 3. Check Supabase logs for the function: no raw PII, LinkedIn status 2xx.
 * 4. LinkedIn Campaign Manager → Conversion → Recent activity shows the event after test traffic.
 */

export interface LinkedInSignupResult {
  ok: boolean;
  eventId?: string;
  status?: number | "dry_run";
  requestId?: string;
  warnings?: unknown;
  code?: string;
  error?: string;
}

interface SendLinkedInSignupOptions {
  conversionId: string;
  email: string;
  value?: number;
  currency?: string;
  alsoFireClient?: boolean;
  consentGranted?: boolean;
}

const FUNCTIONS_ENDPOINT = "/functions/v1/linkedin-capi";

function ensureEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  throw new Error("crypto.randomUUID is not available in this environment");
}

function resolveUserAgent(): string | undefined {
  if (typeof navigator !== "undefined" && typeof navigator.userAgent === "string") {
    return navigator.userAgent;
  }
  return undefined;
}

function isDev(): boolean {
  try {
    return Boolean((import.meta as any)?.env?.DEV);
  } catch (_) {
    return false;
  }
}

async function safeParseJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return await response.json();
  } catch (_) {
    return {};
  }
}

export async function sendLinkedInSignup({
  conversionId,
  email,
  value,
  currency,
  alsoFireClient = false,
  consentGranted = true,
}: SendLinkedInSignupOptions): Promise<LinkedInSignupResult> {
  const eventId = ensureEventId();

  if (alsoFireClient && typeof window !== "undefined" && typeof window.lintrk === "function") {
    const numericId = Number(conversionId);
    if (!Number.isNaN(numericId)) {
      try {
        window.lintrk("track", { conversion_id: numericId });
      } catch (error) {
        if (isDev()) {
          console.warn("LI client pixel error", error);
        }
      }
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (consentGranted === true) {
    headers["x-consent-analytics"] = "true";
  } else if (consentGranted === false) {
    headers["x-consent-analytics"] = "false";
  }

  const body: Record<string, unknown> = {
    conversionId,
    email,
    eventId,
    userAgent: resolveUserAgent(),
  };

  if (typeof value === "number" && Number.isFinite(value)) {
    body.value = value;
  }
  if (typeof currency === "string" && currency.trim().length > 0) {
    body.currency = currency;
  }

  try {
    const response = await fetch(FUNCTIONS_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      keepalive: true,
    });
    const payload = await safeParseJson(response);
    const result: LinkedInSignupResult = {
      ok: Boolean(payload.ok) && response.ok,
      eventId: typeof payload.eventId === "string" ? payload.eventId : eventId,
      status: typeof payload.status === "number" || payload.status === "dry_run" ? payload.status : undefined,
      requestId: typeof payload.requestId === "string" ? payload.requestId : undefined,
      warnings: payload.warnings,
      code: typeof payload.code === "string" ? payload.code : undefined,
      error: typeof payload.error === "string" ? payload.error : undefined,
    };

    if (!result.eventId) {
      result.eventId = eventId;
    }

    if (!result.ok && result.code === undefined) {
      result.code = response.ok ? "unknown_failure" : `http_${response.status}`;
    }

    if (!result.ok && result.error === undefined && !response.ok) {
      result.error = response.statusText || "unknown";
    }

    if (isDev()) {
      console.info("LI CAPI", result);
    }

    return result;
  } catch (error) {
    const failure: LinkedInSignupResult = {
      ok: false,
      eventId,
      code: "network_error",
      error: error instanceof Error ? error.message : "unknown",
    };
    if (isDev()) {
      console.info("LI CAPI", failure);
    }
    return failure;
  }
}

export function testLinkedInSignup(conversionId: string, email: string) {
  return sendLinkedInSignup({ conversionId, email, alsoFireClient: false, consentGranted: true });
}

declare global {
  interface Window {
    lintrk?: (command: string, payload: { conversion_id: number }) => void;
    liTest?: (conversionId: string, email: string) => Promise<LinkedInSignupResult>;
  }
}

if (typeof window !== "undefined" && isDev()) {
  if (typeof window.liTest !== "function") {
    window.liTest = (conversionId: string, email: string) => testLinkedInSignup(conversionId, email);
  }
}
