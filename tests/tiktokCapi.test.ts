import test from 'node:test';
import assert from 'node:assert/strict';
import { sendTikTokEvent } from '../supabase/functions/_shared/tiktokCapi.ts';

const originalEnv = { ...process.env };

function resetEnv() {
  process.env = { ...originalEnv } as any;
}

test('sends event to TikTok Events API', async () => {
  resetEnv();
  process.env.TIKTOK_PIXEL_ID = 'pixel';
  process.env.TIKTOK_ACCESS_TOKEN = 'token';
  const calls: Array<{ url: string; options: any }> = [];
  globalThis.fetch = async (url: any, options: any) => {
    calls.push({ url: String(url), options });
    return { ok: true, json: async () => ({}) } as any;
  };
  await sendTikTokEvent({
    event: 'ViewContent',
    event_id: 'e1',
    properties: { value: 1, currency: 'USD' },
    user: { email: 'hash', ip: '1.1.1.1', user_agent: 'ua' },
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://business-api.tiktok.com/open_api/v1.3/event/track/');
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.pixel_code, 'pixel');
  assert.equal(body.event, 'ViewContent');
  assert.equal(body.event_id, 'e1');
  assert.equal(body.properties.value, 1);
  assert.equal(body.context.user.email[0], 'hash');
});

test('throws on missing env', async () => {
  resetEnv();
  await assert.rejects(
    () => sendTikTokEvent({ event: 'Lead', event_id: '1' }),
    /TIKTOK_ACCESS_TOKEN/
  );
});
