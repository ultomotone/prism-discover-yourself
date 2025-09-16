import test from "node:test";
import assert from "node:assert/strict";

import { getTop3List } from "../src/components/assessment/ResultsV2";

test("getTop3List uses top_types when present", () => {
  const out = getTop3List({
    top_types: ["AAA", "BBB", "CCC"],
    type_scores: {
      AAA: { fit: 70 },
      BBB: { fit: 60 },
      CCC: { fit: 55 },
    },
  });
  assert.deepEqual(
    out.map((x) => x.code),
    ["AAA", "BBB", "CCC"]
  );
});

test("getTop3List falls back to top_3_fits when top_types missing", () => {
  const out = getTop3List({ top_3_fits: [{ code: "X", fit: 71 }, { code: "Y", fit: 67 }] });
  assert.deepEqual(
    out.map((x) => x.code),
    ["X", "Y"]
  );
});

test("getTop3List falls back to primary type when both missing", () => {
  const out = getTop3List({ type_code: "LII", score_fit_calibrated: 72.4 });
  assert.deepEqual(out, [{ code: "LII", fit: 72.4 }]);
});
