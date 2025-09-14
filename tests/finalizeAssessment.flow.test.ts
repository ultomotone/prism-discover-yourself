import { createClient } from "@supabase/supabase-js";
import test from "node:test";
import assert from "node:assert/strict";

const url = process.env.SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !service) {
  test.skip("requires Supabase env", () => {});
} else {
  test("finalizeAssessment runs complete scoring flow", async () => {
    const supabase = createClient(url, service);
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

    const { data, error } = await supabase.functions.invoke("finalizeAssessment", {
      body: { session_id: session.id },
    });
    assert.equal(error, null);
    assert.equal(data.status, "success");
    assert.equal(data.profile.session_id, session.id);

    const { data: again } = await supabase.functions.invoke("finalizeAssessment", {
      body: { session_id: session.id },
    });
    assert.equal(again.status, "success");
  });
}
