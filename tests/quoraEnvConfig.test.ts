import test from "node:test";
import assert from "node:assert/strict";

void test("QUORA_PIXEL_ID prefers env variables", async (t) => {
  const originalEnv = process.env.VITE_QUORA_PIXEL_ID;
  const originalConfig = (globalThis as any).__APP_CONFIG__;

  process.env.VITE_QUORA_PIXEL_ID = "env-value";
  delete (globalThis as any).__APP_CONFIG__;

  t.after(() => {
    if (originalEnv === undefined) {
      delete process.env.VITE_QUORA_PIXEL_ID;
    } else {
      process.env.VITE_QUORA_PIXEL_ID = originalEnv;
    }
    if (originalConfig === undefined) {
      delete (globalThis as any).__APP_CONFIG__;
    } else {
      (globalThis as any).__APP_CONFIG__ = originalConfig;
    }
  });

  const module = await import(`../src/lib/env.ts?case=env-${Date.now()}`);
  assert.equal(module.QUORA_PIXEL_ID, "env-value");
});

void test("QUORA_PIXEL_ID falls back to app config", async (t) => {
  const originalEnv = process.env.VITE_QUORA_PIXEL_ID;
  const originalConfig = (globalThis as any).__APP_CONFIG__;

  delete process.env.VITE_QUORA_PIXEL_ID;
  (globalThis as any).__APP_CONFIG__ = { QUORA_PIXEL_ID: "config-value" };

  t.after(() => {
    if (originalEnv === undefined) {
      delete process.env.VITE_QUORA_PIXEL_ID;
    } else {
      process.env.VITE_QUORA_PIXEL_ID = originalEnv;
    }
    if (originalConfig === undefined) {
      delete (globalThis as any).__APP_CONFIG__;
    } else {
      (globalThis as any).__APP_CONFIG__ = originalConfig;
    }
  });

  const module = await import(`../src/lib/env.ts?case=config-${Date.now()}`);
  assert.equal(module.QUORA_PIXEL_ID, "config-value");
});
