import test from 'node:test';
import assert from 'node:assert/strict';

// Minimal DOM stubs for importing Results.tsx
(globalThis as any).window = {
  document: { createElement: () => ({ setAttribute: () => {}, style: {} }) },
  location: { href: '' },
  __APP_CONFIG__: { SUPABASE_URL: 'http://localhost', SUPABASE_ANON_KEY: 'anon' },
};
(globalThis as any).document = (globalThis as any).window.document;
(globalThis as any).navigator = { userAgent: '' };

const { classifyRpcError } = await import('../src/pages/Results.tsx');

test('classifyRpcError categorizes common RPC errors', () => {
  assert.equal(classifyRpcError({ status: 404 }), 'expired_or_invalid_token');
  assert.equal(
    classifyRpcError({ message: 'no_data_found' }),
    'expired_or_invalid_token'
  );
  assert.equal(classifyRpcError({ status: 403 }), 'not_authorized');
  assert.equal(classifyRpcError({ status: 429 }), 'transient');
  assert.equal(classifyRpcError({ status: 503 }), 'transient');
  assert.equal(classifyRpcError({ status: 418 }), 'unknown');
});
