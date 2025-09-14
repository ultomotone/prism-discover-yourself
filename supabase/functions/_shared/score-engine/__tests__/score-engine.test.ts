import { test } from "node:test";
import assert from "node:assert";
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { scoreAssessment } from "../index.ts";

const goldDir = path.join(import.meta.dirname, "goldens");
const pairs = readdirSync(goldDir)
  .filter((f) => f.endsWith('.input.json'))
  .map((f) => f.replace('.input.json', ''));

for (const name of pairs) {
  test(`parity:${name}`, () => {
    const input = JSON.parse(readFileSync(path.join(goldDir, `${name}.input.json`), 'utf8'));
    const expected = JSON.parse(readFileSync(path.join(goldDir, `${name}.output.json`), 'utf8'));
    const result = scoreAssessment(input);
    assert.deepStrictEqual(result, expected);
  });

  test(`deterministic:${name}`, () => {
    const input = JSON.parse(readFileSync(path.join(goldDir, `${name}.input.json`), 'utf8'));
    const r1 = scoreAssessment(input);
    const r2 = scoreAssessment(input);
    assert.strictEqual(JSON.stringify(r1), JSON.stringify(r2));
  });
}

test('resumed session yields same final result', () => {
  const input = JSON.parse(readFileSync(path.join(goldDir, `g1.input.json`), 'utf8'));
  const partial = { ...input, responses: input.responses.slice(0, 2) };
  // simulate early scoring with partial answers
  scoreAssessment(partial);
  const singleShot = scoreAssessment(input);
  const resumed = scoreAssessment(input);
  assert.deepStrictEqual(resumed, singleShot);
});

test('fc_map derives forced-choice strengths', () => {
  const cfg = {
    results_version: 'v1.2.1',
    dim_thresholds: { one: 0, two: 0, three: 0 },
    neuro_norms: { mean: 0, sd: 1 },
    overlay_neuro_cut: 0,
    overlay_state_weights: { stress: 0, time: 0, sleep: 0, focus: 0 },
    softmax_temp: 1,
    conf_raw_params: { a: 0.25, b: 0.35, c: 0.2 },
    fit_band_thresholds: { high_fit: 10, moderate_fit: 5, high_gap: 0.2, moderate_gap: 0.1 },
    fc_expected_min: 0,
  };
  const input = {
    sessionId: 's',
    responses: [
      { question_id: 1, answer_value: 'A' },
      { question_id: 2, answer_value: 'B' },
    ],
    scoringKey: {
      '1': { scale_type: 'LIKERT_1_5', fc_map: { A: 'Ti', B: 'Te' } },
      '2': { scale_type: 'LIKERT_1_5', fc_map: { B: 'Fe' } },
    },
    config: cfg,
  };
  const result = scoreAssessment(input as any);
  assert(result.strengths.Ti > 0);
  assert(result.strengths.Fe > 0);
});
