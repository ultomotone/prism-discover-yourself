import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSystemStatus } from '../src/utils/systemStatus';

test('defaults missing fields', () => {
  assert.deepEqual(normalizeSystemStatus({}), {
    status: 'green',
    message: '',
    last_updated: undefined,
    updated_by: undefined,
  });
});

test('preserves valid fields', () => {
  const raw = {
    status: 'yellow',
    message: 'Maintenance',
    last_updated: '2024-01-01',
    updated_by: 'admin',
  };
  assert.deepEqual(normalizeSystemStatus(raw), raw);
});
