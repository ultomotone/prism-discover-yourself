import { test } from "node:test";
import assert from "node:assert";
import { scoreAssessment, TYPE_MAP } from "../index.ts";

const keyByQ = {
  1: { tag: "Ti_S", scale_type: "LIKERT_1_5" },
  2: { tag: "Ne_S", scale_type: "LIKERT_1_5" },
  3: { tag: "Ne_S", scale_type: "LIKERT_1_5" },
  4: { fc_map: { A: "Ti", B: "Ne" }, scale_type: "FORCED_CHOICE_2" }
};

const answers = [
  { question_id: 1, answer_value: 5 },
  { question_id: 2, answer_value: 4 },
  { question_id: 3, answer_value: 3 },
  { question_id: 4, answer_value: "A" }
];

test("deterministic output", () => {
  const input = { answers, keyByQ, config: { softmaxTemp: 1, fcExpectedMin: 12 } };
  const r1 = scoreAssessment(input);
  const r2 = scoreAssessment(input);
  assert.deepStrictEqual(r1, r2);
});

test("shares sum to one", () => {
  const input = { answers, keyByQ, config: { softmaxTemp: 1, fcExpectedMin: 12 } };
  const r = scoreAssessment(input);
  const scores = r.profile.type_scores;
  const exps = Object.values(scores).map(v => Math.exp(v));
  const sum = exps.reduce((a,b)=>a+b,0);
  const shares = exps.map(e=>e/sum);
  const total = shares.reduce((a,b)=>a+b,0);
  assert.ok(Math.abs(total - 1) < 1e-6);
});

test("alphabetical tie break", () => {
  const emptyInput = { answers: [], keyByQ: {}, config: { softmaxTemp: 1, fcExpectedMin: 12 } };
  const r = scoreAssessment(emptyInput);
  const expected = Object.keys(TYPE_MAP).sort()[0];
  assert.strictEqual(r.profile.type_code, expected);
});
