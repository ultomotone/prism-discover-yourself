import './setup/dom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { trackTikTokEvent } from '../tracking/cal-tracking.js';
import crypto from 'node:crypto';

test('trackTikTokEvent posts to server with hashed identifiers', async () => {
  window.__consent = { analytics: true };
  window.__ip = '1.2.3.4';
  const ttqCalls: any[] = [];
  const identifyCalls: any[] = [];
  (window as any).ttq = {
    track: (event: string, props: any) => {
      ttqCalls.push({ event, props });
    },
    identify: (data: any) => identifyCalls.push(data),
  } as any;

  const fetchCalls: any[] = [];
  globalThis.fetch = async (url: any, options: any) => {
    fetchCalls.push({ url, options });
    return { ok: true, json: async () => ({}) } as any;
  };

  await trackTikTokEvent(
    'CompleteRegistration',
    { content_name: 'Signup' },
    { email: 'user@example.com' },
  );

  assert.equal(ttqCalls.length, 1);
  assert.equal(ttqCalls[0].event, 'CompleteRegistration');
  assert.ok(ttqCalls[0].props.event_id);
  assert.equal(identifyCalls.length, 1);

  assert.equal(fetchCalls.length, 1);
  const body = JSON.parse(fetchCalls[0].options.body);
  assert.equal(body.event, 'CompleteRegistration');
  const expectedHash = crypto
    .createHash('sha256')
    .update('user@example.com')
    .digest('hex');
  assert.equal(body.user.email, expectedHash);
});
