import test from "node:test";
import assert from "node:assert/strict";

void test("sendQuoraEvent returns undefined when window missing", async (t) => {
  const originalWindow = (globalThis as any).window;
  delete (globalThis as any).window;

  t.after(() => {
    if (originalWindow) {
      (globalThis as any).window = originalWindow;
    } else {
      delete (globalThis as any).window;
    }
  });

  const module = await import("../src/lib/quora/events.ts");
  assert.equal(module.sendQuoraEvent("GenerateLead"), undefined);
});

void test("sendQuoraEvent forwards payload and captures conversion id", async (t) => {
  const calls: Array<{ event: string; payload: Record<string, unknown> }> = [];
  (globalThis as any).window = {
    qpTrack(event: string, payload: Record<string, unknown>) {
      calls.push({ event, payload });
      return "conv-123";
    },
  };

  t.after(() => {
    delete (globalThis as any).window;
  });

  const { sendQuoraEvent } = await import("../src/lib/quora/events.ts");
  const returned = sendQuoraEvent(
    "Purchase",
    { value: 42, currency: "USD" },
    { allowOnResults: true },
  );

  assert.equal(returned, "conv-123");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, "Purchase");
  assert.equal(calls[0].payload.value, 42);
  assert.equal(calls[0].payload.currency, "USD");
  assert.equal(calls[0].payload.__allowResults, true);
  assert.equal((globalThis as any).window.__lastQuoraConversionId, "conv-123");
});

void test("sendQuoraPageView attaches page_path when provided", async (t) => {
  const calls: Array<{ event: string; payload: Record<string, unknown> }> = [];
  (globalThis as any).window = {
    qpTrack(event: string, payload: Record<string, unknown>) {
      calls.push({ event, payload });
      return "conv-pv";
    },
  };

  t.after(() => {
    delete (globalThis as any).window;
  });

  const { sendQuoraPageView } = await import("../src/lib/quora/events.ts");
  sendQuoraPageView("/test/path");

  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, "ViewContent");
  assert.equal(calls[0].payload.page_path, "/test/path");
});
