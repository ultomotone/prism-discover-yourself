const viteEnv = (typeof import.meta !== "undefined" ? (import.meta as any).env : undefined) ?? {};
const nodeEnv = (typeof process !== "undefined" ? process.env : undefined) ?? {};

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
