import { createClient } from "@supabase/supabase-js";
import test from "node:test";
import assert from "node:assert/strict";

const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon || !service) {
  test.skip("requires Supabase env", () => {});
} else {
  test("token access succeeds and respects ttl", async () => {
    const svc = createClient(url, service);
  const { data: sess } = await svc.from("assessment_sessions").insert({}).select().single();
  const { data: prof } = await svc
    .from("profiles")
    .insert({
      session_id: sess.id,
      user_id: "00000000-0000-0000-0000-000000000000",
      share_token: "tok",
      share_token_expires_at: new Date(Date.now() + 1000).toISOString(),
    })
    .select()
    .single();

  const anonClient = createClient(url, anon);
  const { data } = await anonClient.rpc("get_results_by_session", {
    session_id: sess.id,
    t: "tok",
  });
  assert.equal(data.profile.id, prof.id);

  await svc
    .from("assessment_sessions")
    .update({ share_token_expires_at: new Date(Date.now() - 1000).toISOString() })
    .eq("id", sess.id);
  const { data: expired } = await anonClient.rpc("get_results_by_session", {
    session_id: sess.id,
    t: "tok",
  });
  assert.equal(expired, null);
  });
}
