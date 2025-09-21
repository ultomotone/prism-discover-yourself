import test from 'node:test';
import assert from 'node:assert/strict';
import { buildResultsLink } from '../supabase/functions/_shared/results-link.ts';
import { resultsQueryKeys } from '../src/features/results/queryKeys.ts';

test('buildResultsLink constructs correct URL', () => {
  const url = buildResultsLink('https://staging.prismassessment.com', 's1', 't1');
  assert.equal(url, 'https://staging.prismassessment.com/results/s1?t=t1');
});

test('buildResultsLink trims trailing slash', () => {
  const url = buildResultsLink('https://staging.prismassessment.com/', 's', 't');
  assert.equal(url, 'https://staging.prismassessment.com/results/s?t=t');
});

test('buildResultsLink adds scoring version when provided', () => {
  const url = buildResultsLink('https://prismpersonality.com', 'sess', 'token', { scoringVersion: 'v2.0' });
  assert.equal(url, 'https://prismpersonality.com/results/sess?t=token&sv=v2.0');
});

test('finalize payload generates deterministic results link and query key', () => {
  const resultId = 'uuid';
  const scoringVersion = '2.3.1';
  const url = buildResultsLink('https://app.prism.com', resultId, null, { scoringVersion });
  assert.equal(url, 'https://app.prism.com/results/uuid?sv=2.3.1');

  const key = resultsQueryKeys.session(resultId, 'no-token', scoringVersion);
  assert.deepEqual(key, ['results', 'by-session', 'uuid', 'no-token', '2.3.1']);
});
