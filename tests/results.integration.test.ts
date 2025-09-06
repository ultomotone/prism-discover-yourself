import test from 'node:test';
import assert from 'node:assert/strict';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
 (globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'anon' } };

const { fetchResults, FetchResultsError } = await import('../src/features/results/api');
import type { ProfileResult } from '../src/types/profile';

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

test('unauthorized does not retry', async () => {
  let calls = 0;
  server.use(
    http.post('https://api.test/functions/v1/get-results-by-session', async () => {
      calls++;
      if (calls === 1) {
        return HttpResponse.json({ message: 'nope' }, { status: 401 });
      }
      const profile: ProfileResult = {
        session_id: 's',
        type_code: 'IEE',
        base_func: 'Ne',
        creative_func: 'Fi',
        overlay: '+',
        strengths: {},
        dimensions: {},
        trait_scores: {},
        score_fit_raw: 0,
        score_fit_calibrated: 0,
        fit_band: 'High',
        confidence: 'High',
        conf_raw: 0,
        conf_calibrated: 0,
        close_call: false,
        top_gap: 0,
        top_types: [],
        type_scores: {},
        results_version: 'v1.0.0',
      };
      return HttpResponse.json({ profile, session: { id: 's', status: 'completed' } });
    }),
  );

  const client = createClient();
  await assert.rejects(() => fetchResults({ sessionId: 's' }, client), (e) =>
    e instanceof FetchResultsError && e.kind === 'unauthorized',
  );
  assert.equal(calls, 1);
});
