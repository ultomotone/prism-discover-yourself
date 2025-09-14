import { test } from "node:test";
import assert from "node:assert";
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { scoreAssessment, TYPE_MAP } from "../index.ts";

const goldDir = path.join(import.meta.dirname, "goldens");
const pairs = readdirSync(goldDir)
  .filter(f => f.endsWith('.input.json'))
  .map(f => f.replace('.input.json',''));

for (const name of pairs) {
  test(`parity:${name}`, () => {
    const input = JSON.parse(readFileSync(path.join(goldDir, `${name}.input.json`), 'utf8'));
    const expected = JSON.parse(readFileSync(path.join(goldDir, `${name}.output.json`), 'utf8'));
    if (!expected.profile.base_func) {
      const map = TYPE_MAP[expected.profile.type_code as keyof typeof TYPE_MAP];
      expected.profile.base_func = map.base;
      expected.profile.creative_func = map.creative;
    }
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
  const partial = { ...input, answers: input.answers.slice(0,2) };
  // simulate early scoring with partial answers
  scoreAssessment(partial);
  const singleShot = scoreAssessment(input);
  const resumed = scoreAssessment(input);
  assert.deepStrictEqual(resumed, singleShot);
});

test('fc_map derives forced-choice strengths', () => {
  const input = {
    answers: [
      { question_id: 1, answer_value: 'A' },
      { question_id: 2, answer_value: 'B' },
    ],
    keyByQ: {
      '1': { scale_type: 'LIKERT_1_5', fc_map: { A: 'Ti', B: 'Te' } },
      '2': { scale_type: 'LIKERT_1_5', fc_map: { B: 'Fe' } },
    },
    config: { softmaxTemp: 1 },
  };
  const result = scoreAssessment(input as any);
  assert.strictEqual(result.fc_source, 'derived');
  assert(result.profile.strengths.Ti > 0);
  assert(result.profile.strengths.Fe > 0);
});
