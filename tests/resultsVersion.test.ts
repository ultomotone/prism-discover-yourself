import { createClient } from "@supabase/supabase-js";
import test from "node:test";
import assert from "node:assert/strict";
import { RESULTS_VERSION, parseResultsVersion } from "../supabase/functions/_shared/resultsVersion.ts";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  test.skip("requires Supabase env", () => {});
} else {
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  test("scoring_config.results_version matches engine constant", async () => {
    const { data, error } = await supabase
      .from("scoring_config")
      .select("value")
      .eq("key", "results_version")
      .maybeSingle();

    assert.equal(error, null);
    assert.ok(data, "results_version row is required");

    const dbVersion = parseResultsVersion(data?.value ?? null);
    assert.ok(dbVersion, "database results_version must be a string");
    assert.equal(dbVersion, RESULTS_VERSION);
  });
}
