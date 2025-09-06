/** Hash an email using SHA-256 after trimming and lowercasing */
export async function hashEmail(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const data = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface BuildEventParams {
  event: string;
  conversionId: string;
  pixelId: string;
  clickId?: string;
  email?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface RedditEventPayload {
  pixel_id: string;
  events: Array<Record<string, unknown>>;
}

/** Build payload for Reddit Conversions API */
export async function buildEventPayload(
  params: BuildEventParams,
): Promise<RedditEventPayload> {
  const {
    event,
    conversionId,
    pixelId,
    clickId,
    email,
    userAgent,
    ipAddress,
  } = params;

  const evt: Record<string, unknown> = {
    event_type: event,
    event_id: conversionId,
    action_source: 'web',
    timestamp: Math.floor(Date.now() / 1000),
  };

  if (clickId) evt.click_id = clickId;
  if (userAgent) evt.user_agent = userAgent;
  if (ipAddress) evt.ip_address = ipAddress;
  if (email) evt.email = [await hashEmail(email)];

  return {
    pixel_id: pixelId,
    events: [evt],
  };
}
