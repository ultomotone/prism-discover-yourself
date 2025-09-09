diff --git a/tests/fetchResults.test.ts b/tests/fetchResults.test.ts
--- a/tests/fetchResults.test.ts
+++ b/tests/fetchResults.test.ts
@@ -1,58 +1,49 @@
 import test from 'node:test';
 import assert from 'node:assert/strict';
-import type { Profile } from '../src/features/results/types';
+import type { Profile } from '../src/features/results/types';
 
 (globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'anon' } };
 
 const { fetchResultsBySession: fetchResults, FetchResultsError } = await import('../src/features/results/api');
 
-// Unify on RPC client helper
-type FnFn = (name: string, args: any) => Promise<{ data: unknown; error: any }>;
-function createClient(fn: FnFn) {
-  return { rpc: fn, functions: { invoke: async () => ({ data: null, error: null }) } } as any;
-}
+type RpcFn = (name: string, params: any) => Promise<{ data: unknown; error: any }>;
+function createClient(rpcImpl: RpcFn): any {
+  return { rpc: rpcImpl, functions: { invoke: async () => ({ data: null, error: null }) } };
+}
 
-test('calls RPC when share token provided', async () => {
-  let called: string | undefined;
-  const client = createClient(async (name) => {
-    called = name;
-    return { data: { id: 'p1' }, error: null };
-  });
+test('calls RPC with token when provided', async () => {
+  let name = '';
+  let params: any = null;
+  const client = createClient(async (n, p) => {
+    name = n; params = p;
+    return { data: { profile: { id: 'p1' }, session: { id: 's', status: 'completed' } }, error: null };
+  });
   const res = await fetchResults({ sessionId: 's', shareToken: 't' }, client);
   assert.equal(res.profile.id, 'p1');
-  assert.equal(called, 'get_profile_by_session_token');
+  assert.equal(name, 'get_results_by_session');
+  assert.deepEqual(params, { session_id: 's', t: 't' });
 });
 
 test('calls RPC without share token', async () => {
-  let called: string | undefined;
-  const client = createClient(async (name) => {
-    called = name;
+  let name = '';
+  const client = createClient(async (n) => {
+    name = n;
     return { data: { profile: { id: 'p2' }, session: { id: 's', status: 'completed' } }, error: null };
   });
   const res = await fetchResults({ sessionId: 's' }, client);
   assert.equal(res.profile.id, 'p2');
-  assert.equal(called, 'get_results_by_session');
+  assert.equal(name, 'get_results_by_session');
 });
 
 test('dedupes concurrent calls', async () => {
   let calls = 0;
-  const client = createClient(async () => {
+  const client = createClient(async (_n, _p) => {
     calls++;
     return { data: { profile: { id: 'p3' }, session: { id: 's', status: 'completed' } }, error: null };
   });
   const [a, b] = await Promise.all([
     fetchResults({ sessionId: 's' }, client),
     fetchResults({ sessionId: 's' }, client),
   ]);
   assert.equal(calls, 1);
   assert.deepEqual(a, b);
 });
 
 test('retries transient errors', async () => {
   let attempts = 0;
-  const client = createClient(async () => {
+  const client = createClient(async (_n, _p) => {
     attempts++;
     if (attempts < 2) {
       return { data: null, error: { code: '500' } };
     }
     return { data: { profile: { id: 'p4' }, session: { id: 's', status: 'completed' } }, error: null };
   });
   const res = await fetchResults({ sessionId: 's' }, client);
   assert.equal(res.profile.id, 'p4');
   assert.equal(attempts, 2);
 });
 
 test('treats 429 as transient', async () => {
   let attempts = 0;
-  const client = createClient(async () => {
+  const client = createClient(async (_n, _p) => {
     attempts++;
     return attempts < 2
       ? { data: null, error: { code: '429' } }
       : { data: { profile: { id: 'p5' }, session: { id: 's', status: 'completed' } }, error: null };
   });
   const res = await fetchResults({ sessionId: 's' }, client);
   const profile: Profile = res.profile;
   assert.equal(profile.id, 'p5');
   assert.equal(attempts, 2);
 });
 
 test('does not retry non-transient errors', async () => {
   let attempts = 0;
-  const client = createClient(async () => {
+  const client = createClient(async (_n, _p) => {
     attempts++;
     return { data: null, error: { code: '401' } };
   });
   await assert.rejects(() => fetchResults({ sessionId: 's' }, client), (e) =>
     e instanceof FetchResultsError && e.kind === 'unauthorized',
   );
   assert.equal(attempts, 1);
 });
 
 test('maps error variants', async () => {
-  const cases: Array<[string, FetchResultsError['kind']]> = [
+  const cases: Array<[string, FetchResultsError['kind']]> = [
     ['404', 'not_found'],
     ['401', 'unauthorized'],
     ['403', 'forbidden'],
     ['400', 'invalid'],
   ];
-  for (const [status, kind] of cases) {
-    const client = createClient(async () => ({ data: null, error: { code: String(status) } }));
+  for (const [status, kind] of cases) {
+    const client = createClient(async (_n, _p) => ({ data: null, error: { code: String(status) } }));
     await assert.rejects(() => fetchResults({ sessionId: 's' }, client), (e) =>
       e instanceof FetchResultsError && e.kind === kind,
     );
   }
 });
