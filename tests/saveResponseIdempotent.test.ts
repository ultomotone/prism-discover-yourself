import test from 'node:test';
import assert from 'node:assert/strict';

(globalThis as any).window = {
  __APP_CONFIG__: {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'anon',
  },
};

const { saveResponseIdempotent, SaveResponseException } = await import('../src/services/assessmentSaves');

type MockRpcResult = { data: unknown; error: any } | Promise<{ data: unknown; error: any }>;

type MockClient = {
  rpc: (name: string, payload: Record<string, unknown>) => MockRpcResult;
  functions: {
    invoke: (name: string, options: { body: Record<string, unknown> }) => MockRpcResult;
  };
};

type PartialParams = Partial<Parameters<typeof saveResponseIdempotent>[0]>;

function createParams(overrides: PartialParams = {}) {
  return Object.assign(
    {
      sessionId: 'session-1',
      questionId: 42,
      answer: 'Yes',
      questionText: 'Example?',
      questionType: 'single',
      questionSection: 'intro',
    },
    overrides,
  );
}

function createClient(impl: Partial<MockClient>): MockClient {
  return {
    rpc: impl.rpc || (async () => ({ data: null, error: null })),
    functions: {
      invoke: impl.functions?.invoke || (async () => ({ data: { ok: true }, error: null })),
    },
  };
}

test('persists responses via RPC when function is available', async () => {
  let rpcCalls = 0;
  const client = createClient({
    rpc: async (name, payload) => {
      rpcCalls += 1;
      assert.equal(name, 'save_assessment_response');
      assert.equal(payload.p_session_id, 'session-1');
      assert.equal(payload.p_question_id, 42);
      return { data: null, error: null };
    },
    functions: {
      invoke: async () => {
        throw new Error('edge fallback should not execute when RPC succeeds');
      },
    },
  });

  await saveResponseIdempotent(createParams(), client as any);
  assert.equal(rpcCalls, 1);
});

test('falls back to edge function when RPC is missing', async () => {
  let fallbackCalls = 0;
  let capturedBody: Record<string, unknown> | null = null;
  const client = createClient({
    rpc: async () => ({ data: null, error: { code: 'PGRST404', message: 'not found' } }),
    functions: {
      invoke: async (name, options) => {
        fallbackCalls += 1;
        assert.equal(name, 'save_response');
        capturedBody = options.body;
        return { data: { ok: true }, error: null };
      },
    },
  });

  await saveResponseIdempotent(
    createParams({ answer: ['A', 'B'], questionId: '7' }),
    client as any,
  );

  assert.equal(fallbackCalls, 1);
  assert.ok(capturedBody);
  assert.equal(capturedBody?.session_id, 'session-1');
  assert.equal(capturedBody?.question_id, 7);
  assert.deepEqual(capturedBody?.answer_array, ['A', 'B']);
});

test('uses edge fallback when RPC call throws', async () => {
  let fallbackCalls = 0;
  const client = createClient({
    rpc: async () => {
      throw new Error('network timeout');
    },
    functions: {
      invoke: async () => {
        fallbackCalls += 1;
        return { data: { ok: true }, error: null };
      },
    },
  });

  await saveResponseIdempotent(createParams({ questionId: 5 }), client as any);
  assert.equal(fallbackCalls, 1);
});

test('throws typed error when RPC returns non-recoverable error', async () => {
  const client = createClient({
    rpc: async () => ({ data: null, error: { code: '400', message: 'invalid payload' } }),
  });

  await assert.rejects(
    () => saveResponseIdempotent(createParams(), client as any),
    (error: unknown) =>
      error instanceof SaveResponseException &&
      error.kind === 'rpc_error' &&
      /invalid payload/i.test(String((error.cause as { message?: string } | undefined)?.message ?? '')),
  );
});

test('propagates edge error when fallback fails', async () => {
  const client = createClient({
    rpc: async () => ({ data: null, error: { code: 'PGRST404', message: 'missing' } }),
    functions: {
      invoke: async () => ({ data: null, error: { message: 'denied' } }),
    },
  });

  await assert.rejects(
    () => saveResponseIdempotent(createParams(), client as any),
    (error: unknown) => error instanceof SaveResponseException && error.kind === 'edge_error',
  );
});
