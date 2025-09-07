import test from 'node:test';
import assert from 'node:assert/strict';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
(globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'anon' } };

const { fetchResults, FetchResultsError } = await import('../src/features/results/api');

type Client = {
  functions: { invoke: (name: string, opts: any) => Promise<{ data: unknown; error: any }> };
  rpc: (...args: any[]) => Promise<{ data: unknown; error: any }>;
};

function createClient(): Client {
  return {
    rpc: async () => ({ data: null, error: null }),
    functions: {
      invoke: async (name: string, options: any) => {
        const res = await fetch(`https://api.test/functions/v1/${name}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(options.body),
          signal: options.signal,
        });
        if (!res.ok) {
          return { data: null, error: { status: res.status, message: await res.text() } };
        }
        return { data: await res.json(), error: null };
      },
    },
  } as Client;
}

const server = setupServer();
server.listen({ onUnhandledRequest: 'error' });
test.after(() => server.close());

test('missing share token yields unauthorized', async () => {
  let calls = 0;
  server.use(
    http.post('https://api.test/functions/v1/get-results-by-session', async ({ request }) => {
      calls++;
      const body = await request.json();
      if (!body.shareToken) {
        return HttpResponse.json({ message: 'token required' }, { status: 401 });
      }
      return HttpResponse.json({ profile: { id: 'p' }, session: { id: 's', status: 'completed' } });
    }),
  );

  const client = createClient();
  await assert.rejects(() => fetchResults({ sessionId: 's' }, client), (e) =>
    e instanceof FetchResultsError && e.kind === 'unauthorized',
  );
  assert.equal(calls, 1);
});
