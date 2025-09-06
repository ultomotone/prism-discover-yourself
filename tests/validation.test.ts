import test from 'node:test';
import assert from 'node:assert/strict';
import { validateUuid, assertUuid } from '../supabase/functions/_shared/validation.ts';

test('validateUuid accepts valid UUID', () => {
  assert.equal(validateUuid('123e4567-e89b-12d3-a456-426614174000'), true);
});

test('validateUuid rejects invalid UUID', () => {
  assert.equal(validateUuid('not-a-uuid'), false);
});

test('assertUuid throws on invalid value', () => {
  assert.throws(() => assertUuid('bad-id'), /valid UUID/);
});
