import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRetakeAllowance } from '../src/services/retake';

test('retake allowance surfaces next eligible date when blocked', async () => {
  const originalFetch = global.fetch;
  let capturedBody: Record<string, unknown> | null = null;

  global.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    assert.match(String(input), /can_start_new_session$/);
    if (init?.body) {
      capturedBody = JSON.parse(init.body as string);
    }
    return new Response(
      JSON.stringify({ allowed: false, next_eligible_date: '2025-02-01T00:00:00Z', attempt_no: 3 }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }) as typeof fetch;

  try {
    const result = await checkRetakeAllowance({
      email: 'person@example.com',
      maxPerWindow: 3,
      windowDays: 30,
    });

    assert.equal(result.allowed, false);
    assert.equal(result.nextEligibleDate, '2025-02-01T00:00:00Z');
    assert.equal(result.attemptNo, 3);
    assert.ok(capturedBody);
    assert.equal(capturedBody?.email, 'person@example.com');
    assert.equal(capturedBody?.max_per_window, 3);
    assert.equal(capturedBody?.window_days, 30);
  } finally {
    global.fetch = originalFetch;
  }
});

test('retake window enforces three attempts then blocks until window resets', async () => {
  const originalFetch = global.fetch;
  let requestCount = 0;

  global.fetch = (async (): Promise<Response> => {
    requestCount += 1;
    if (requestCount <= 3) {
      return new Response(
        JSON.stringify({ allowed: true, attempt_no: requestCount }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (requestCount === 4) {
      return new Response(
        JSON.stringify({
          allowed: false,
          attempt_no: 4,
          next_eligible_date: '2025-03-01T00:00:00Z',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ allowed: true, attempt_no: 1 }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }) as typeof fetch;

  try {
    for (let i = 1; i <= 3; i += 1) {
      const allowance = await checkRetakeAllowance({ maxPerWindow: 3, windowDays: 30 });
      assert.equal(allowance.allowed, true);
      assert.equal(allowance.attemptNo, i);
    }

    const blocked = await checkRetakeAllowance({ maxPerWindow: 3, windowDays: 30 });
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.attemptNo, 4);
    assert.equal(blocked.nextEligibleDate, '2025-03-01T00:00:00Z');

    const reset = await checkRetakeAllowance({ maxPerWindow: 3, windowDays: 30 });
    assert.equal(reset.allowed, true);
    assert.equal(reset.attemptNo, 1);
  } finally {
    global.fetch = originalFetch;
  }
});

test('retake allowance defaults to allow when edge function missing', async () => {
  const originalFetch = global.fetch;

  global.fetch = (async (): Promise<Response> =>
    new Response(JSON.stringify({ error: 'not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch;

  try {
    const allowance = await checkRetakeAllowance({ maxPerWindow: 3, windowDays: 30 });
    assert.equal(allowance.allowed, true);
    assert.equal(allowance.nextEligibleDate, null);
    assert.equal(allowance.attemptNo, undefined);
  } finally {
    global.fetch = originalFetch;
  }
});

test('retake allowance defaults to allow on network failure', async () => {
  const originalFetch = global.fetch;

  global.fetch = (async () => {
    throw new Error('socket hang up');
  }) as typeof fetch;

  try {
    const allowance = await checkRetakeAllowance({ maxPerWindow: 3, windowDays: 30 });
    assert.equal(allowance.allowed, true);
    assert.equal(allowance.nextEligibleDate, null);
    assert.equal(allowance.attemptNo, undefined);
  } finally {
    global.fetch = originalFetch;
  }
});
