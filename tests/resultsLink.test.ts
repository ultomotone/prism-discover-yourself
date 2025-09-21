import test from 'node:test';
import assert from 'node:assert/strict';
import { buildResultsLink } from '../supabase/functions/_shared/results-link.ts';

test('buildResultsLink constructs correct URL', () => {
  const url = buildResultsLink('https://staging.prismassessment.com', 's1', 't1');
  assert.equal(url, 'https://staging.prismassessment.com/results/s1?t=t1');
});

test('buildResultsLink trims trailing slash', () => {
  const url = buildResultsLink('https://staging.prismassessment.com/', 's', 't');
  assert.equal(url, 'https://staging.prismassessment.com/results/s?t=t');
});

test('buildResultsLink adds scoring version when provided', () => {
  const url = buildResultsLink('https://prismpersonality.com', 'sess', 'token', { version: 'v2.0' });
  assert.equal(url, 'https://prismpersonality.com/results/sess?t=token&sv=v2.0');
});
