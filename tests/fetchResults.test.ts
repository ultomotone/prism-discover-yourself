import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchResults } from '../src/features/results/api';

type RpcFn = (...args: any[]) => Promise<any>;

type FnInvoke = (...args: any[]) => Promise<any>;

function createSupabaseMock(rpcImpl?: RpcFn, fnImpl?: FnInvoke) {
  return {
    rpc: async (...args: any[]) => (rpcImpl ? rpcImpl(...args) : { data: null, error: null }),
    functions: { invoke: async (...args: any[]) => (fnImpl ? fnImpl(...args) : { data: null, error: null }) },
  } as any;
}

test('fetchResults uses RPC when share token provided', async () => {
  let rpcCalls = 0;
  let fnCalls = 0;
  const supabase = createSupabaseMock(
    async () => {
      rpcCalls++; return { data: { id: 'p1' }, error: null };
    },
    async () => {
      fnCalls++; return { data: { profile: { id: 'p1' }, session: { id: 's', status: 'completed' } }, error: null };
    }
  );
  const res = await fetchResults({ supabase, sessionId: 's', shareToken: 't' });
  assert.equal(res.profile.id, 'p1');
  assert.equal(rpcCalls, 1);
  assert.equal(fnCalls, 0);
});

test('fetchResults falls back to edge function without share token', async () => {
  let rpcCalls = 0;
  let fnCalls = 0;
  const supabase = createSupabaseMock(
    async () => { rpcCalls++; return { data: null, error: null }; },
    async () => { fnCalls++; return { data: { profile: { id: 'p2' }, session: { id: 's', status: 'completed' } }, error: null }; }
  );
  const res = await fetchResults({ supabase, sessionId: 's' });
  assert.equal(res.profile.id, 'p2');
  assert.equal(rpcCalls, 0);
  assert.equal(fnCalls, 1);
});
