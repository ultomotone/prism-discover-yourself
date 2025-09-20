const viteEnv = (typeof import.meta !== "undefined" ? (import.meta as any).env : undefined) ?? {};
const nodeEnv = (typeof process !== "undefined" ? process.env : undefined) ?? {};

const rawPaywall =
  viteEnv.VITE_PAYWALL_ENABLED ??
  nodeEnv.VITE_PAYWALL_ENABLED ??
  nodeEnv.PAYWALL_ENABLED;

function toBoolean(value: unknown): boolean {
  if (value === true) return true;
  if (value === false) return false;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["1", "true", "yes", "on"].includes(normalized);
  }
  if (typeof value === "number") {
    return value === 1;
  }
  return false;
}

export const PAYWALL_ENABLED = toBoolean(rawPaywall);
