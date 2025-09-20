import { createClient } from "@supabase/supabase-js";
import test from "node:test";
import assert from "node:assert/strict";
import { RESULTS_VERSION } from "../supabase/functions/_shared/resultsVersion.ts";

type FinalizeResponse = {
  ok: boolean;
  status?: string;
  profile: { id: string; session_id: string; results_version?: string | null };
  share_token: string;
  results_url: string;
  results_version: string;
};

const url = process.env.SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !service) {
  test.skip("requires Supabase env", () => {});
} else {
  const supabase = createClient(url, service);

  test("finalizeAssessment orchestrates scoring and reuse", async () => {
    const { data: session } = await supabase
      .from("assessment_sessions")
      .insert({ user_id: "00000000-0000-0000-0000-000000000000" })
      .select()
      .single();

    await supabase.from("assessment_responses").insert({
      session_id: session.id,
      question_id: 1,
      answer_value: 3,
    });

    const first = await supabase.functions.invoke<FinalizeResponse>("finalizeAssessment", {
      body: { session_id: session.id },
    });
    assert.equal(first.error, null);
    assert(first.data);
    assert.equal(first.data.ok, true);
    assert.equal(first.data.profile.session_id, session.id);
    assert.equal(first.data.profile.results_version, RESULTS_VERSION);
    assert.equal(first.data.results_version, RESULTS_VERSION);
    assert.match(first.data.share_token, /^[0-9a-f-]{36}$/);
    assert.ok(first.data.results_url.includes(session.id));

    const second = await supabase.functions.invoke<FinalizeResponse>("finalizeAssessment", {
      body: { session_id: session.id },
    });
    assert.equal(second.error, null);
    assert(second.data);
    assert.equal(second.data.ok, true);
    assert.equal(second.data.profile.id, first.data.profile.id);
    assert.equal(second.data.share_token, first.data.share_token);
    assert.equal(second.data.results_url, first.data.results_url);
  });

  test("production session can be finalized without direct score_prism", async () => {
    const sessionId = "618c5ea6-aeda-4084-9156-0aac9643afd3";

    const first = await supabase.functions.invoke<FinalizeResponse>("finalizeAssessment", {
      body: { session_id: sessionId },
    });

    if (first.error) {
      console.log("finalizeAssessment error:", first.error);
      assert.fail(`finalizeAssessment failed: ${first.error.message}`);
    }

    assert(first.data);
    assert.equal(first.data.ok, true);
    assert.equal(first.data.results_version, RESULTS_VERSION);

    const { data: profile } = await supabase
      .from("profiles")
      .select("session_id, results_version")
      .eq("session_id", sessionId)
      .maybeSingle();

    assert(profile, "expected profile to exist after finalizeAssessment");
    assert.equal(profile?.results_version, RESULTS_VERSION);
  });
}
