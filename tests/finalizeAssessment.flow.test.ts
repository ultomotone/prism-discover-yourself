import test from "node:test";
import assert from "node:assert/strict";
import { finalizeAssessment } from "../supabase/functions/finalizeAssessment/finalize.ts";
import { RESULTS_VERSION } from "../supabase/functions/_shared/resultsVersion.ts";

class SupabaseStub {
  public profileRow: Record<string, any> | null = null;
  public sessionRow: Record<string, any> | null = null;
  public fcInvocations = 0;
  public prismInvocations = 0;

  constructor(
    private readonly profileFactory: () => Record<string, any>,
    private readonly fcShouldError = false,
  ) {}

  from(table: string) {
    if (table === "profiles") {
      return {
        select: () => this.from(table),
        eq: (_column: string, _value: string) => this.from(table),
        maybeSingle: async () => ({
          data: this.profileRow,
          error: null,
        }),
        upsert: async (values: Record<string, unknown>) => {
          this.profileRow = { ...(this.profileRow ?? {}), ...values };
          return { error: null };
        },
      };
    }

    if (table === "assessment_sessions") {
      return {
        select: () => this.from(table),
        eq: (_column: string, _value: string) => this.from(table),
        maybeSingle: async () => ({ data: this.sessionRow, error: null }),
        upsert: async (values: Record<string, unknown>) => {
          this.sessionRow = { ...(this.sessionRow ?? {}), ...values };
          return { error: null };
        },
      };
    }

    throw new Error(`Unexpected table ${table}`);
  }

  functions = {
    invoke: async (name: string, _args: { body: Record<string, unknown> }) => {
      if (name === "score_fc_session") {
        this.fcInvocations += 1;
        if (this.fcShouldError) {
          return { data: null, error: { message: "no fc" } };
        }
        return { data: { ok: true }, error: null };
      }

      if (name === "score_prism") {
        this.prismInvocations += 1;
        const profile = this.profileFactory();
        this.profileRow = { ...profile };
        return { data: { status: "success", profile }, error: null };
      }

      throw new Error(`Unexpected function ${name}`);
    },
  };
}

function createProfile(overrides: Partial<Record<string, any>> = {}) {
  return {
    id: "profile-1",
    session_id: "session-1",
    type_code: "ILE",
    top_3_fits: [{ fit: 0.82 }, { fit: 0.6 }],
    conf_calibrated: 0.74,
    fc_answered_ct: 12,
    ...overrides,
  };
}

test("finalizeAssessment is idempotent across repeated calls", async () => {
  const stub = new SupabaseStub(() => createProfile());
  const logs: Record<string, unknown>[] = [];

  const first = await finalizeAssessment({
    supabase: stub,
    sessionId: "session-1",
    responses: [{}, {}],
    siteUrl: "https://example.com",
    now: () => new Date("2024-01-01T00:00:00Z"),
    logger: (entry) => logs.push(entry),
  });

  assert.equal(stub.prismInvocations, 1);
  assert.ok(first.share_token);
  assert.ok(first.results_url.includes(first.share_token));

  const second = await finalizeAssessment({
    supabase: stub,
    sessionId: "session-1",
    responses: null,
    siteUrl: "https://example.com",
    now: () => new Date("2024-01-01T00:01:00Z"),
    logger: (entry) => logs.push(entry),
  });

  assert.equal(stub.prismInvocations, 1, "score_prism should not be invoked twice");
  assert.equal(second.share_token, first.share_token);
  assert.equal(second.results_url, first.results_url);
  assert.deepEqual(second.profile, first.profile);

  const events = logs.map((entry) => entry.evt);
  assert.ok(events.includes("finalize_scored"));
  assert.ok(events.includes("finalize_return_existing"));
});

test("finalizeAssessment returns share token and URL and tolerates missing FC", async () => {
  const stub = new SupabaseStub(() => createProfile(), true);
  const response = await finalizeAssessment({
    supabase: stub,
    sessionId: "session-2",
    responses: [{ question_id: 1 }],
    siteUrl: "https://prismassessment.com",
    now: () => new Date("2024-02-02T00:00:00Z"),
    logger: () => {},
  });

  assert.equal(stub.fcInvocations, 1, "score_fc_session should be attempted");
  assert.equal(stub.prismInvocations, 1, "score_prism should run once");
  assert.ok(response.share_token.length > 0);
  assert.ok(response.results_url.startsWith("https://prismassessment.com"));
  assert.ok(response.results_url.includes(`t=${response.share_token}`));

  const repeat = await finalizeAssessment({
    supabase: stub,
    sessionId: "session-2",
    siteUrl: "https://prismassessment.com",
    now: () => new Date("2024-02-02T00:10:00Z"),
    logger: () => {},
  });

  assert.equal(stub.prismInvocations, 1, "second call should be fast-return");
  assert.equal(repeat.share_token, response.share_token);
});

test("finalizeAssessment response stamps results version", async () => {
  const stub = new SupabaseStub(() => createProfile({ results_version: "legacy" }));
  const result = await finalizeAssessment({
    supabase: stub,
    sessionId: "session-3",
    siteUrl: "https://example.org",
    now: () => new Date("2024-03-03T00:00:00Z"),
    logger: () => {},
  });

  assert.equal(result.results_version, RESULTS_VERSION);
  assert.equal(result.profile.results_version, RESULTS_VERSION);
});

