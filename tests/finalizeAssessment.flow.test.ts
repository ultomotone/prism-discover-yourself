import { createClient } from "@supabase/supabase-js";
import { expect, test } from "vitest";

const url = process.env.SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
  expect(error).toBeNull();
  expect(data.status).toBe("success");
  expect(data.profile.session_id).toBe(session.id);

  const { data: again } = await supabase.functions.invoke("finalizeAssessment", {
    body: { session_id: session.id },
  });
  expect(again.status).toBe("success");
});
