
interface RedditEvent {
  event_name: string;
  conversion_id: string;
  click_id?: string;
  email?: string; // already SHA256 hashed and normalized
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

function b64(str: string): string {
  if (typeof btoa === "function") return btoa(str);
  return Buffer.from(str, "utf8").toString("base64");
}

export async function sendRedditCapiEvent(evt: RedditEvent, fetchImpl: typeof fetch = fetch): Promise<void> {
  const clientId = getEnv("REDDIT_CLIENT_ID");
  const clientSecret = getEnv("REDDIT_CLIENT_SECRET");
  const pixelId = getEnv("REDDIT_PIXEL_ID");
  if (!clientId) throw new Error("Missing env REDDIT_CLIENT_ID");
  if (!clientSecret) throw new Error("Missing env REDDIT_CLIENT_SECRET");
  if (!pixelId) throw new Error("Missing env REDDIT_PIXEL_ID");

  const tokenRes = await fetchImpl("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${b64(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!tokenRes.ok) {
    throw new Error(`Failed to fetch access token: ${tokenRes.status}`);
  }
  const tokenJson: { access_token?: string } = await tokenRes.json();
  const accessToken = tokenJson.access_token;
  if (!accessToken) throw new Error("Missing access_token in token response");

  const body = {
    events: [
      {
        event_type: evt.event_name,
        event_time: Math.floor(Date.now() / 1000),
        pixel_id: pixelId,
        conversion_id: evt.conversion_id,
        click_id: evt.click_id,
        user: evt.email ? { hashed_email: evt.email } : undefined,
      },
    ],
  };

  const resp = await fetchImpl("https://ads-api.reddit.com/api/v2/conversions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    throw new Error(`Reddit CAPI request failed: ${resp.status}`);
  }
}

export type { RedditEvent };
