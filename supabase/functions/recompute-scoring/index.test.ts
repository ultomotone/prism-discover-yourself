import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { needsRecompute, recomputeSessions, type CompletenessCounts, type RecomputeSummary } from "./index.ts";

Deno.test("needsRecompute returns false when counts meet thresholds", () => {
  const counts: CompletenessCounts = { types: 16, functions: 8, state: 1 };
  assertEquals(needsRecompute(counts), false);
});

Deno.test("needsRecompute returns true when any bucket is short", () => {
  const cases: CompletenessCounts[] = [
    { types: 15, functions: 8, state: 1 },
    { types: 16, functions: 7, state: 1 },
    { types: 16, functions: 8, state: 0 },
  ];
  for (const entry of cases) {
    assertEquals(needsRecompute(entry), true);
  }
});

Deno.test("recomputeSessions invokes pipeline and reports updated", async () => {
  const invoked: string[] = [];
  let completenessCalls = 0;
  const summary = await recomputeSessions(
    { sessionId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" },
    {
      listSessions: async () => [{ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", user_id: null, status: "completed", completed_at: new Date().toISOString() }],
      fetchCompleteness: async () => {
        completenessCalls += 1;
        return completenessCalls === 1
          ? { types: 0, functions: 0, state: 0 }
          : { types: 16, functions: 8, state: 1 };
      },
      invokeScoreFc: async (sessionId) => {
        invoked.push(`fc:${sessionId}`);
        return { ok: true };
      },
      invokeScorePrism: async (sessionId) => {
        invoked.push(`prism:${sessionId}`);
        return { ok: true };
      },
    },
  );

  assertEquals(summary.ok, true);
  assertEquals(summary.updatedCount, 1);
  assertEquals(summary.results[0].status, "updated");
  assertEquals(invoked, ["fc:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "prism:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"]);
});

Deno.test("recomputeSessions surfaces invocation failures", async () => {
  const summary: RecomputeSummary = await recomputeSessions(
    { sessionId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" },
    {
      listSessions: async () => [{ id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", user_id: null, status: "completed", completed_at: new Date().toISOString() }],
      fetchCompleteness: async () => ({ types: 0, functions: 0, state: 0 }),
      invokeScoreFc: async () => ({ ok: false, error: "fc_failed" }),
      invokeScorePrism: async () => ({ ok: true }),
    },
  );

  assertEquals(summary.ok, true);
  assertEquals(summary.updatedCount, 0);
  assertEquals(summary.results[0].status, "failed");
  assertEquals(summary.results[0].reason, "fc_failed");
});
