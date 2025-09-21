import test from "node:test";
import assert from "node:assert/strict";

declare global {
  // Minimal interface to satisfy TypeScript when we stub window
  // eslint-disable-next-line no-var
  var window: any;
}

const createStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
};

void test("getConfiguredRedditPixelId returns null when unset", async (t) => {
  const originalWindow = (globalThis as any).window;
  delete (globalThis as any).window;

  t.after(() => {
    if (originalWindow) {
      (globalThis as any).window = originalWindow;
    } else {
      delete (globalThis as any).window;
    }
  });

  const module = await import("../src/lib/reddit/config.ts");
  module.__unsafeResetRedditPixelConfigCacheForTests();

  assert.equal(module.getConfiguredRedditPixelId(), null);
});

void test("getConfiguredRedditPixelId reads from __APP_CONFIG__ and persists", async (t) => {
  const storage = createStorage();
  const originalWindow = (globalThis as any).window;
  (globalThis as any).window = {
    __APP_CONFIG__: { REDDIT_PIXEL_ID: "  a2_hisg7r10d2ta  " },
    localStorage: storage,
  };

  t.after(() => {
    if (originalWindow) {
      (globalThis as any).window = originalWindow;
    } else {
      delete (globalThis as any).window;
    }
  });

  const module = await import("../src/lib/reddit/config.ts");
  module.__unsafeResetRedditPixelConfigCacheForTests();

  const pixelId = module.getConfiguredRedditPixelId();
  assert.equal(pixelId, "a2_hisg7r10d2ta");
  assert.equal(storage.getItem("reddit_app_id"), "a2_hisg7r10d2ta");
});

void test("getConfiguredRedditPixelId prefers localStorage cache", async (t) => {
  const storage = createStorage();
  storage.setItem("reddit_app_id", "cached-id");
  const originalWindow = (globalThis as any).window;
  (globalThis as any).window = {
    localStorage: storage,
  };

  t.after(() => {
    if (originalWindow) {
      (globalThis as any).window = originalWindow;
    } else {
      delete (globalThis as any).window;
    }
  });

  const module = await import("../src/lib/reddit/config.ts");
  module.__unsafeResetRedditPixelConfigCacheForTests();

  assert.equal(module.getConfiguredRedditPixelId(), "cached-id");
});
