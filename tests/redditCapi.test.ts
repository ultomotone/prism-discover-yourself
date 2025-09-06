import test from 'node:test';
import assert from 'node:assert/strict';

const { hashEmail, buildEventPayload } = await import('../supabase/functions/_shared/reddit.ts');

test('hashEmail normalizes and hashes', async () => {
  const a = await hashEmail(' Test@Example.com ');
  const b = await hashEmail('test@example.com');
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{64}$/);
});

test('buildEventPayload constructs payload with optional fields', async () => {
  const payload = await buildEventPayload({
    event: 'SignUp',
    conversionId: 'abc',
    pixelId: 'pid',
    clickId: 'cid',
    email: 'user@example.com',
    userAgent: 'ua',
    ipAddress: '1.2.3.4',
  });
  assert.equal(payload.pixel_id, 'pid');
  const evt = payload.events[0] as any;
  assert.equal(evt.event_type, 'SignUp');
  assert.equal(evt.event_id, 'abc');
  assert.equal(evt.click_id, 'cid');
  assert.equal(evt.user_agent, 'ua');
  assert.equal(evt.ip_address, '1.2.3.4');
  assert.equal(evt.email.length, 1);
});

test('buildEventPayload omits optional fields when absent', async () => {
  const payload = await buildEventPayload({
    event: 'PageVisit',
    conversionId: 'xyz',
    pixelId: 'pid',
  });
  const evt = payload.events[0] as any;
  assert.ok(!('click_id' in evt));
  assert.ok(!('email' in evt));
});
