// _shared/rateLimit.ts
// Simple in-memory token bucket (per-instance). Good enough to deter bursts.
const buckets = new Map<string, { tokens: number; ts: number }>();

export function rateLimit(key: string, capacity = 60, refillPerMs = (5 * 60 * 1000) / 60) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    b = { tokens: capacity, ts: now };
    buckets.set(key, b);
  }
  const elapsed = now - b.ts;
  b.tokens = Math.min(capacity, b.tokens + elapsed / refillPerMs);
  b.ts = now;
  if (b.tokens < 1) return { allowed: false as const, retryAfter: 5 };
  b.tokens -= 1;
  return { allowed: true as const };
}

export function ipFrom(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
