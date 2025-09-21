import test from "node:test";
import assert from "node:assert/strict";
import { finalizeAssessmentCore } from "../supabase/functions/_shared/finalizeAssessmentCore.ts";
import { RESULTS_VERSION } from "../supabase/functions/_shared/resultsVersion.ts";

type MockProfile = {
  id: string;
  session_id: string;
  fc_answered_ct?: number | null;
  type_code?: string | null;
  top_gap?: number | null;
  conf_calibrated?: number | null;
  validity_status?: string | null;
  results_version?: string | null;
  version?: string | null;
};

type MockSession = {
  id: string;
  share_token: string | null;
  share_token_expires_at: string | null;
  completed_at: string | null;
  finalized_at: string | null;
  completed_questions: number | null;
  status: string | null;
  updated_at: string | null;
};

test("finalizeAssessmentCore is idempotent and reports path", async () => {
  const now = new Date("2024-01-01T00:00:00.000Z");
  let profileStore: MockProfile | null = null;
  let sessionStore: MockSession = {
    id: "sess-1",
    share_token: null,
    share_token_expires_at: null,
    completed_at: null,
    finalized_at: null,
    completed_questions: null,
    status: null,
    updated_at: null,
  };
  let prismCalls = 0;

  const deps = {
    acquireLock: async () => () => {},
    getProfile: async () => profileStore,
    normalizeProfile: async (profile: MockProfile) => {
      profileStore = {
        ...profile,
        results_version: RESULTS_VERSION,
        version: RESULTS_VERSION,
      };
      return profileStore;
    },
    scoreFcSession: async () => {
      /* no-op */
    },
    scorePrism: async () => {
      prismCalls += 1;
      const created: MockProfile = {
        id: "profile-1",
        session_id: "sess-1",
        fc_answered_ct: 90,
        type_code: "LII",
        top_gap: 0.42,
        conf_calibrated: 0.71,
        validity_status: "valid",
      };
      profileStore = created;
      return { status: "success", profile: created };
    },
    getSession: async () => sessionStore,
    upsertSession: async (_sessionId: string, patch: Partial<MockSession>) => {
      sessionStore = { ...sessionStore, ...patch };
    },
    generateShareToken: () => {
      const token = sessionStore.share_token ?? "token-123";
      sessionStore = { ...sessionStore, share_token: token };
      return token;
    },
    buildResultsUrl: (_base: string, resultId: string, token: string, scoringVersion: string) =>
      `/results/${resultId}?t=${token}&sv=${scoringVersion}`,
    now: () => now,
    log: () => {
      /* no-op */
    },
  } as const;

  const first = await finalizeAssessmentCore(deps, {
    sessionId: "sess-1",
    siteUrl: "https://example.com",
    responses: new Array(90).fill({}),
  });

  assert.equal(first.ok, true);
  assert.equal(first.profile.results_version, RESULTS_VERSION);
  assert.equal(first.share_token, "token-123");
  assert.equal(first.results_url, "/results/sess-1?t=token-123&sv=v1.2.1");
  assert.equal(first.results_version, RESULTS_VERSION);
  assert.equal(first.result_id, "sess-1");
  assert.equal(first.scoring_version, RESULTS_VERSION);
  assert.equal(prismCalls, 1);
  assert.equal(first.path, "scored");

  const second = await finalizeAssessmentCore(deps, {
    sessionId: "sess-1",
    siteUrl: "https://example.com",
  });

  assert.equal(second.ok, true);
  assert.equal(second.profile.results_version, RESULTS_VERSION);
  assert.equal(second.share_token, "token-123");
  assert.equal(second.results_url, "/results/sess-1?t=token-123&sv=v1.2.1");
  assert.equal(prismCalls, 1, "score_prism should not be invoked twice");
  assert.equal(second.path, "cache_hit");
  assert.equal(second.result_id, "sess-1");
  assert.equal(second.scoring_version, RESULTS_VERSION);
});
