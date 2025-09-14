import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyRpcError } from '../src/features/results/errorClassifier';

test('classify RPC errors', async (t) => {
  await t.test('404 => expired_or_invalid_token', () => {
    assert.equal(classifyRpcError({ status: 404 }), 'expired_or_invalid_token');
  });
  await t.test('no_data_found => expired_or_invalid_token', () => {
    assert.equal(classifyRpcError({ message: 'no_data_found' }), 'expired_or_invalid_token');
  });
  await t.test('403 => not_authorized', () => {
    assert.equal(classifyRpcError({ status: 403 }), 'not_authorized');
  });
  await t.test('429 => transient', () => {
    assert.equal(classifyRpcError({ status: 429 }), 'transient');
  });
  await t.test('503 => transient', () => {
    assert.equal(classifyRpcError({ status: 503 }), 'transient');
  });
  await t.test('500 => unknown', () => {
    assert.equal(classifyRpcError({ status: 500 }), 'unknown');
  });
});
