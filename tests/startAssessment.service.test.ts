import test from 'node:test';
import assert from 'node:assert/strict';

import { supabase, SUPABASE_ANON_KEY } from '../src/lib/supabaseClient';
import {
  startAssessment,
  markAssessmentComplete,
  logAssessmentError,
} from '../src/services/assessment/start';
import * as emailAudit from '../src/services/email-audit';

const originalFetch = globalThis.fetch;
const originalFrom = supabase.from;
const originalGetSession = supabase.auth.getSession.bind(supabase.auth);
const auditCalls: Array<{ subject: string; message: string }> = [];
function primeSuccessMocks() {
  auditCalls.length = 0;
  emailAudit.setAuditEmailImplementation(async ({ subject, message }: { subject: string; message: string }) => {
    auditCalls.push({ subject, message });
  });

  (supabase.auth as any).getSession = async () => ({
    data: { session: { access_token: 'test-token' } },
    error: null,
  });

  (supabase as any).from = () => ({
    insert: () => ({
      select: () => ({
        single: async () => ({
          data: { id: 'session-1', account_id: 'acc', status: 'started' },
          error: null,
        }),
      }),
    }),
  });
}

test.beforeEach(() => {
  primeSuccessMocks();
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => new Response('', { status: 200 })) as typeof fetch;
});

test('startAssessment inserts a session, links account, and audits lifecycle', async () => {
  let lastRequest: { url: string; headers: Record<string, string> } | null = null;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers ?? {});
    lastRequest = { url: String(input), headers: Object.fromEntries(headers.entries()) };
    return new Response('', { status: 200 });
  }) as typeof fetch;

  const session = await startAssessment({ accountId: 'acc' });

  assert.equal(session.id, 'session-1');
  assert.ok(lastRequest);
  assert.ok(lastRequest!.url.endsWith('/functions/v1/link_session_to_account'));
  assert.equal(lastRequest!.headers['content-type'], 'application/json');
  assert.equal(lastRequest!.headers.apikey, SUPABASE_ANON_KEY);
  assert.equal(lastRequest!.headers.authorization, 'Bearer test-token');
  assert.deepEqual(
    auditCalls.map((c) => c.subject),
    ['Assessment start requested', 'Assessment session created', 'Assessment started'],
  );
});

test('startAssessment surfaces errors and records audit failure details', async () => {
  globalThis.fetch = (async () => new Response('bad', { status: 500 })) as typeof fetch;

  await assert.rejects(() => startAssessment({ accountId: 'acc' }), /link_session_to_account failed/);
  assert.deepEqual(auditCalls.map((c) => c.subject), [
    'Assessment start requested',
    'Assessment session created',
    'Assessment start error',
  ]);
});

test('completion and error helpers emit audit events', async () => {
  auditCalls.length = 0;
  await markAssessmentComplete('acc', 'session-1');
  await logAssessmentError('acc', 'session-1', new Error('boom'));
  assert.deepEqual(auditCalls.map((c) => c.subject), [
    'Assessment completed',
    'Assessment error',
  ]);
});

test.after(() => {
  globalThis.fetch = originalFetch;
  (supabase as any).from = originalFrom;
  (supabase.auth as any).getSession = originalGetSession;
  emailAudit.setAuditEmailImplementation(null);
});
