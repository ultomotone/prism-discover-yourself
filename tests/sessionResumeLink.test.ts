import test from 'node:test';
import assert from 'node:assert/strict';
import { getSessionResumePath } from '../src/services/sessionLinking';

test('builds continue path for session', () => {
  const id = 'abc-123';
  assert.equal(getSessionResumePath(id), `/continue/${id}`);
});
