interface TikTokEvent {
  event: string;
  event_id?: string;
  timestamp?: number;
  properties?: Record<string, any>;
  user?: {
    email?: string; // hashed
    phone?: string; // hashed
    external_id?: string; // hashed
    ip?: string;
    user_agent?: string;
    ttclid?: string;
    ttp?: string;
  };
}

function getEnv(key: string): string | undefined {
  if (typeof Deno !== "undefined") {
    return Deno.env.get(key);
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }
  return undefined;
}

function clean<T extends Record<string, any>>(obj: T): T {
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      const arr = v.filter((x) => x !== undefined && x !== null);
      if (arr.length) out[k] = arr;
    } else if (typeof v === "object" && !(v instanceof Date)) {
      const cleaned = clean(v as any);
      if (Object.keys(cleaned).length) out[k] = cleaned;
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

export async function sendTikTokEvent(evt: TikTokEvent, fetchImpl: typeof fetch = fetch): Promise<void> {
  const token = getEnv("TIKTOK_ACCESS_TOKEN");
  const pixelId = getEnv("TIKTOK_PIXEL_ID");
  if (!token) throw new Error("Missing env TIKTOK_ACCESS_TOKEN");
  if (!pixelId) throw new Error("Missing env TIKTOK_PIXEL_ID");

  const body = clean({
    pixel_code: pixelId,
    event: evt.event,
    event_id: evt.event_id,
    timestamp: evt.timestamp ?? Math.floor(Date.now() / 1000),
    properties: evt.properties,
    context: {
      ip: evt.user?.ip,
      user_agent: evt.user?.user_agent,
      user: clean({
        email: evt.user?.email ? [evt.user.email] : undefined,
        phone: evt.user?.phone ? [evt.user.phone] : undefined,
        external_id: evt.user?.external_id ? [evt.user.external_id] : undefined,
        ttclid: evt.user?.ttclid,
        ttp: evt.user?.ttp,
      }),
    },
  });

  const resp = await fetchImpl("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
    method: "POST",
    headers: {
      "Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    throw new Error(`TikTok CAPI request failed: ${resp.status}`);
  }
}

export type { TikTokEvent };
