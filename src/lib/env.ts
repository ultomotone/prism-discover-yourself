const viteEnv = typeof import.meta !== "undefined" ? (import.meta as any).env ?? {} : {};
const nodeEnv = typeof process !== "undefined" ? process.env ?? {} : {};

const previewSource =
  viteEnv.VITE_PREVIEW ??
  (viteEnv.VERCEL_ENV ?? nodeEnv.VERCEL_ENV) ??
  undefined;

export const IS_PREVIEW =
  typeof previewSource === "string"
    ? previewSource === "true" || previewSource === "1" || previewSource === "preview"
    : Boolean(previewSource);

export const IS_DEV =
  typeof viteEnv.DEV === "boolean"
    ? viteEnv.DEV
    : nodeEnv.NODE_ENV === "development";
