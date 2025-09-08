import test from 'node:test';
import assert from 'node:assert/strict';
import { sendRedditCapiEvent } from '../supabase/functions/_shared/redditCapi.ts';

const originalEnv = { ...process.env };

function resetEnv() {
  process.env = { ...originalEnv } as any;
}

test('sends event to Reddit CAPI', async () => {
  resetEnv();
  process.env.REDDIT_CLIENT_ID = 'id';
  process.env.REDDIT_CLIENT_SECRET = 'secret';
  process.env.REDDIT_PIXEL_ID = 'pixel';
  const calls: Array<{ url: string; options: any }> = [];
  globalThis.fetch = async (url: any, options: any) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('access_token')) {
      return { ok: true, json: async () => ({ access_token: 'tok' }) } as any;
    }
    return { ok: true, json: async () => ({ ok: true }) } as any;
  };
  await sendRedditCapiEvent({ event_name: 'SignUp', conversion_id: 'c1', click_id: 'cid', email: 'hash' });
  assert.equal(calls.length, 2);
  assert.equal(calls[1].url, 'https://ads-api.reddit.com/api/v2/conversions');
  const body = JSON.parse(calls[1].options.body);
  assert.equal(body.events[0].event_type, 'SignUp');
  assert.equal(body.events[0].conversion_id, 'c1');
  assert.equal(body.events[0].click_id, 'cid');
  assert.equal(body.events[0].user.hashed_email, 'hash');
});

test('throws on missing env', async () => {
  resetEnv();
  await assert.rejects(
    () => sendRedditCapiEvent({ event_name: 'PageVisit', conversion_id: 'c2' }),
    /REDDIT_CLIENT_ID/
  );
});
