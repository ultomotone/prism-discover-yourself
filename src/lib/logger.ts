// src/lib/logger.ts
type Fields = Record<string, unknown>;
const REDACT_KEYS = /(^|[_-])(authorization|share_token|email|password|token|apikey)(_|$)/i;

function redactValue(v: unknown): unknown {
  if (typeof v === "string") {
    if (/Bearer\s+[A-Za-z0-9.\-_]+/.test(v)) return "Bearer ***";
    if (/@/.test(v)) return v.replace(/(.{1}).+(@.+)/, "$1***$2");
    if (/^[A-Za-z0-9\-_]{12,}$/.test(v)) return "***";
  }
  return v;
}

function sanitize(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return redactValue(obj);
  if (Array.isArray(obj)) return obj.map(sanitize);
  const out: Fields = {};
  for (const [k, v] of Object.entries(obj as Fields)) {
    if (REDACT_KEYS.test(k)) {
      const redacted = redactValue(v);
      out[k] = redacted === v ? "***" : redacted;
    } else {
      out[k] = sanitize(v);
    }
  }
  return out;
}

function log(level: "info" | "warn" | "error" | "debug", msg: string, fields?: Fields) {
  const base = { level, msg, ts: new Date().toISOString() };
  const payload = fields ? { ...base, ...sanitize(fields) } : base;
  // eslint-disable-next-line no-console
  (console as any)[level === "debug" ? "log" : level](JSON.stringify(payload));
}

export const logger = {
  info: (m: string, f?: Fields) => log("info", m, f),
  warn: (m: string, f?: Fields) => log("warn", m, f),
  error: (m: string, f?: Fields) => log("error", m, f),
  debug: (m: string, f?: Fields) => log("debug", m, f),
};
