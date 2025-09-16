import { createClient } from "@supabase/supabase-js";
import test from "node:test";
import assert from "node:assert/strict";

import type { Database } from "../src/integrations/supabase/types";

const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon || !service) {
  test.skip("requires Supabase env", () => {});
} else {
  test(
    "token access succeeds, rejects legacy arg, and respects ttl",
    async () => {
      const svc = createClient<Database>(url, service, {
        auth: { persistSession: false },
      });
      const futureExpiry = new Date(Date.now() + 60_000).toISOString();

      const { data: sess, error: sessionError } = await svc
        .from("assessment_sessions")
        .insert({
          share_token: "tok-session",
          share_token_expires_at: futureExpiry,
        })
        .select()
        .single();
      assert.equal(sessionError, null);
      assert.ok(sess);
      if (!sess) throw new Error("failed to create session");

      const { data: prof, error: profileError } = await svc
        .from("profiles")
        .insert({
          session_id: sess.id,
          user_id: "00000000-0000-0000-0000-000000000000",
          share_token: "tok",
        })
        .select()
        .single();
      assert.equal(profileError, null);
      assert.ok(prof);
      if (!prof) throw new Error("failed to create profile");

      const anonClient = createClient<Database>(url, anon, {
        auth: { persistSession: false },
      });

      const { data, error } = await anonClient.rpc("get_results_by_session", {
        p_session_id: sess.id,
        t: "tok",
      });
      assert.equal(error, null);
      assert.ok(data);
      if (!data) throw new Error("missing results payload");
      const profile = (data as any).profile;
      assert.ok(profile);
      assert.equal(profile.id, prof.id);

      const { error: expireError } = await svc
        .from("assessment_sessions")
        .update({
          share_token_expires_at: new Date(Date.now() - 60_000).toISOString(),
        })
        .eq("id", sess.id);
      assert.equal(expireError, null);

      const { data: expired, error: expiredError } = await anonClient.rpc(
        "get_results_by_session",
        {
          p_session_id: sess.id,
          t: "tok",
        }
      );
      assert.equal(expiredError, null);
      assert.equal(expired, null);

      // @ts-expect-error - session_id parameter was removed in unified scoring migration
      const legacyCall = await anonClient.rpc("get_results_by_session", {
        session_id: sess.id,
        t: "tok",
      });
      assert.ok(
        legacyCall.error,
        "Expected RPC to reject legacy parameter name"
      );
    }
  );
}
