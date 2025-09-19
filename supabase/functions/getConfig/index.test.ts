import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { defaults, mergeConfigRecords } from "./index.ts";

Deno.test("defaults expose v1.2.1 results version", () => {
  assertEquals(defaults.results_version, "v1.2.1");
});

Deno.test("mergeConfigRecords overlays database values", () => {
  const map = new Map<string, unknown>([
    ["results_version", "v9.9.9"],
    ["custom_key", { hello: "world" }],
  ]);
  const merged = mergeConfigRecords(map);
  assertEquals(merged.results_version, "v9.9.9");
  assertEquals(merged.custom_key, { hello: "world" });
  assertEquals(merged.fc_expected_min, defaults.fc_expected_min);
});
