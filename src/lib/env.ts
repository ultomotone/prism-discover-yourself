const viteEnv = (typeof import.meta !== "undefined" ? (import.meta as any).env : undefined) ?? {};
const nodeEnv = (typeof process !== "undefined" ? process.env : undefined) ?? {};

const appConfig = (() => {
  try {
    if (typeof window !== "undefined" && window && typeof window === "object") {
      const candidate = (window as any).__APP_CONFIG__;
      if (candidate && typeof candidate === "object") {
        return candidate as Record<string, unknown>;
      }
    }
  } catch (_) {
    // Ignore runtime access errors (e.g., window not defined)
  }
  try {
    const candidate = (globalThis as any).__APP_CONFIG__;
    if (candidate && typeof candidate === "object") {
      return candidate as Record<string, unknown>;
    }
  } catch (_) {
    // Ignore global access errors
  }
  return {} as Record<string, unknown>;
})();

const rawQuoraPixelId = (() => {
  const fromVite = viteEnv.VITE_QUORA_PIXEL_ID as string | undefined;
  if (typeof fromVite === "string" && fromVite.trim().length > 0) {
    return fromVite.trim();
  }
  const fromNode = nodeEnv.VITE_QUORA_PIXEL_ID;
  if (typeof fromNode === "string" && fromNode.trim().length > 0) {
    return fromNode.trim();
  }
  const fromConfig = appConfig.QUORA_PIXEL_ID;
  if (typeof fromConfig === "string" && fromConfig.trim().length > 0) {
    return fromConfig.trim();
  }
  return undefined;
})();

export const QUORA_PIXEL_ID = rawQuoraPixelId;

const previewSource =
  viteEnv.VITE_PREVIEW ??
  (viteEnv.VERCEL_ENV ?? nodeEnv.VERCEL_ENV ?? nodeEnv.VITE_PREVIEW ?? nodeEnv.NEXT_PUBLIC_VERCEL_ENV);

export const IS_PREVIEW = Boolean(
  typeof previewSource === "string"
    ? previewSource === "true" || previewSource === "1" || previewSource === "preview"
    : previewSource
);

export const IS_DEV = viteEnv.DEV === true || nodeEnv.NODE_ENV === "development";

export const ADMIN_MODE = String(viteEnv.VITE_ADMIN_MODE ?? nodeEnv.VITE_ADMIN_MODE ?? "full");
