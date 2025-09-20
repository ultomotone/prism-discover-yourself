import test from "node:test";
import assert from "node:assert/strict";
import { buildCompletionLog } from "../supabase/functions/_shared/observability.ts";
import { finalizeAssessmentCore } from "../supabase/functions/_shared/finalizeAssessmentCore.ts";
import { RESULTS_VERSION } from "../supabase/functions/_shared/resultsVersion.ts";

type MockProfile = {
  id: string;
  session_id: string;
  fc_answered_ct?: number | null;
  fc_count?: number | null;
  top_gap?: number | null;
  conf_calibrated?: number | null;
  conf_band?: string | null;
  validity_status?: string | null;
  top_types?: Array<{ code: string }>;
  results_version?: string | null;
  version?: string | null;
  type_code?: string | null;
  user_id?: string | null;
  run_index?: number | null;
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
  user_id?: string | null;
  metadata?: Record<string, unknown> | null;
};

test("buildCompletionLog includes required fields and masks sensitive data", () => {
  const profile: MockProfile = {
    id: "prof-1",
    session_id: "sess-1234567890",
    fc_answered_ct: 8,
    fc_count: 12,
    top_gap: 0.42,
    conf_calibrated: 0.87,
    conf_band: "aligned",
    validity_status: "valid",
    top_types: [{ code: "LII" }, { code: "ILE" }, { code: "IEE" }],
    results_version: RESULTS_VERSION,
    version: RESULTS_VERSION,
    type_code: "LII",
    user_id: "user-123",
    run_index: 3,
  };
  const session: MockSession = {
    id: "sess-1234567890",
    share_token: "token-hidden",
    share_token_expires_at: null,
    completed_at: null,
    finalized_at: null,
    completed_questions: null,
    status: null,
    updated_at: null,
    user_id: "user-123",
    metadata: { attempt_no: 3, payment_status: "paid", email: "test@example.com", share_token: "abc" },
  };

  const log = buildCompletionLog({
    event: "assessment.completed",
    sessionId: session.id,
    profile: profile as any,
    session: session as any,
    resultsVersion: RESULTS_VERSION,
    durationMs: 1523.8,
    extra: { path: "scored" },
  });

  assert.equal(log.event, "assessment.completed");
  assert.equal(log.session_id, session.id);
  assert.equal(log.session_id_masked, session.id.slice(-6).padStart(6, "*"));
  assert.equal(log.user_id, "user-123");
  assert.equal(log.RESULTS_VERSION, RESULTS_VERSION);
  assert.equal(log.fc_used, true);
  assert.equal(log.fc_items_count, 8);
  assert.equal(log.fc_coverage, Number((8 / 12).toFixed(4)));
  assert.deepEqual(log.top_types, ["LII", "ILE", "IEE"]);
  assert.equal(log.top_gap, 0.42);
  assert.equal(log.conf_calibrated, 0.87);
  assert.equal(log.conf_band, "aligned");
  assert.equal(log.validity_status, "valid");
  assert.equal(log.duration_ms, 1524);
  assert.equal(log.attempt_no, 3);
  assert.equal(log.payment_status, "paid");
  assert.equal(log.path, "scored");
  const serialized = JSON.stringify(log);
  assert(!serialized.includes("email"));
  assert(!serialized.includes("share_token"));
});

test("finalize flow produces single completion log with attempt", async () => {
  const now = new Date("2024-02-01T00:00:00.000Z");
  let profileStore: MockProfile | null = null;
  let sessionStore: MockSession = {
    id: "sess-finalize",
    share_token: null,
    share_token_expires_at: null,
    completed_at: null,
    finalized_at: null,
    completed_questions: null,
    status: null,
    updated_at: null,
    user_id: "user-999",
    metadata: { attempt_no: 2, payment_status: "trial" },
  };

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
      const created: MockProfile = {
        id: "profile-xyz",
        session_id: sessionStore.id,
        fc_answered_ct: 10,
        fc_count: 12,
        top_gap: 0.5,
        conf_calibrated: 0.91,
        conf_band: "aligned",
        validity_status: "valid",
        top_types: [{ code: "LII" }, { code: "ILE" }],
        type_code: "LII",
      };
      profileStore = created;
      return { status: "success", profile: created } as const;
    },
    getSession: async () => sessionStore,
    upsertSession: async (_sessionId: string, patch: Partial<MockSession>) => {
      sessionStore = { ...sessionStore, ...patch };
    },
    generateShareToken: () => {
      const token = sessionStore.share_token ?? "token-new";
      sessionStore = { ...sessionStore, share_token: token };
      return token;
    },
    buildResultsUrl: (_base: string, sessionId: string, token: string) => `/results/${sessionId}?t=${token}`,
    now: () => now,
    log: () => {
      /* no-op */
    },
  } as const;

  const result = await finalizeAssessmentCore(deps, {
    sessionId: sessionStore.id,
    siteUrl: "https://example.com",
  });

  const completionLog = buildCompletionLog({
    event: "assessment.completed",
    sessionId: sessionStore.id,
    profile: result.profile as any,
    session: result.session as any,
    resultsVersion: result.results_version,
    durationMs: 875,
    extra: { path: result.path },
  });

  assert.equal(completionLog.event, "assessment.completed");
  assert.equal(completionLog.RESULTS_VERSION, RESULTS_VERSION);
  assert.equal(completionLog.attempt_no, 2);
  assert.equal(completionLog.payment_status, "trial");
  assert.equal(completionLog.path, "scored");
});
