// services/conversions.ts
type ConversionEvent =
  | {
      name: "assessment_completed" | "results_viewed" | "purchase" | "lead";
      sessionId: string;
      userId?: string;
      value?: number;
      currency?: string;
      userAgent?: string;
      ip?: string;
    };

function readEnv(name: string): string | undefined {
  try {
    // Skip Deno env access in client-side code
    if (typeof window === "undefined" && typeof process !== "undefined" && typeof process.env === "object") {
      const value = (process.env as Record<string, string | undefined>)[name];
      if (value != null) return value;
    }
  } catch {
    // ignore
  }
  if (typeof process !== "undefined" && typeof process.env === "object") {
    const value = (process.env as Record<string, string | undefined>)[name];
    if (value != null) return value;
  }
  if (typeof import.meta !== "undefined" && (import.meta as any).env) {
    const value = (import.meta as any).env[`VITE_${name}`] ?? (import.meta as any).env[name];
    if (value != null) return value;
  }
  return undefined;
}

const ENABLED = readEnv("CONVERSIONS_ENABLED") === "true" || readEnv("VITE_CONVERSIONS_ENABLED") === "true";
const QUORA_URL = readEnv("QUORA_CAPI_URL") ?? readEnv("VITE_QUORA_CAPI_URL");
const QUORA_TOKEN = readEnv("QUORA_CAPI_TOKEN") ?? readEnv("VITE_QUORA_CAPI_TOKEN");

function mapEventName(name: ConversionEvent["name"]) {
  switch (name) {
    case "assessment_completed":
      return "CompleteRegistration";
    case "results_viewed":
      return "ViewContent";
    case "purchase":
      return "Purchase";
    case "lead":
      return "GenerateLead";
    default:
      return undefined;
  }
}

export async function sendQuoraEvent(input: {
  token: string;
  url: string;
  event: {
    name: string;
    eventId: string;
    timestamp: number;
    ip?: string;
    userAgent?: string;
    value?: number;
    currency?: string;
  };
}): Promise<{ ok: boolean; status: number; body?: unknown }> {
  try {
    const res = await fetch(input.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.token}`,
      },
      body: JSON.stringify({
        event_name: input.event.name,
        event_id: input.event.eventId,
        time: new Date(input.event.timestamp).toISOString(),
        value: input.event.value,
        currency: input.event.currency,
        context: {
          ip_address: input.event.ip,
          user_agent: input.event.userAgent,
        },
      }),
    });
    const body = await res.json().catch(() => undefined);
    return { ok: res.ok, status: res.status, body };
  } catch {
    return { ok: false, status: 0 };
  }
}

export async function sendConversions(ev: ConversionEvent): Promise<void> {
  if (!ENABLED) return;
  const qName = mapEventName(ev.name);
  if (QUORA_URL && QUORA_TOKEN && qName) {
    await sendQuoraEvent({
      token: QUORA_TOKEN,
      url: QUORA_URL,
      event: {
        name: qName,
        eventId: `${ev.sessionId}:${qName}`,
        timestamp: Date.now(),
        ip: ev.ip,
        userAgent: ev.userAgent,
        value: ev.value,
        currency: ev.currency,
      },
    });
  }
}
