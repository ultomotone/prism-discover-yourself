/* scripts/smoke-results.ts
 * Smoke test for PRISM results RPCs
 *
 * Env vars required:
 *  SUPABASE_URL, SUPABASE_ANON_KEY
 *  SESSION_ID (UUID)
 *  SHARE_TOKEN (for token path and rotate)
 *  USER_JWT (an authenticated user's access token for owner/rotate paths)
 *
 * Usage:
 *   # token path
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... SESSION_ID=... SHARE_TOKEN=... tsx scripts/smoke-results.ts --token
 *   # owner path
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... SESSION_ID=... USER_JWT=... tsx scripts/smoke-results.ts --owner
 *   # rotate
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... SESSION_ID=... SHARE_TOKEN=... USER_JWT=... tsx scripts/smoke-results.ts --rotate
 *   # both paths
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... SESSION_ID=... SHARE_TOKEN=... USER_JWT=... tsx scripts/smoke-results.ts --all
 */

import { request } from 'undici';

type Arg = '--token' | '--owner' | '--all' | '--rotate';
const mode = (process.argv.find(a => a === '--token' || a === '--owner' || a === '--all' || a === '--rotate') as Arg) ?? '--all';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const ANON = process.env.SUPABASE_ANON_KEY ?? '';
const SESSION_ID = process.env.SESSION_ID ?? '';
const SHARE_TOKEN = process.env.SHARE_TOKEN ?? '';
const USER_JWT = process.env.USER_JWT ?? '';

if (!SUPABASE_URL || !ANON || !SESSION_ID) {
  console.error('Missing required env: SUPABASE_URL, SUPABASE_ANON_KEY, SESSION_ID');
  process.exit(2);
}

async function callRpc(path: 'token' | 'owner', tokenOverride?: string) {
  const rpc = 'get_results_by_session';
  const url = `${SUPABASE_URL}/rest/v1/rpc/${rpc}`;

  const headers: Record<string, string> = {
    apikey: ANON,
    'Content-Type': 'application/json',
  };

  // Authorization header:
  // - token path: anon bearer is fine
  // - owner path: must use USER_JWT
  headers['Authorization'] = `Bearer ${path === 'token' ? ANON : USER_JWT}`;

  const body = path === 'token'
    ? JSON.stringify({ session_id: SESSION_ID, t: tokenOverride ?? SHARE_TOKEN })
    : JSON.stringify({ session_id: SESSION_ID });

  const res = await request(url, { method: 'POST', headers, body });
  const text = await res.body.text();

  let parsed: any;
  try { parsed = JSON.parse(text); } catch { /* leave as text */ }

  return {
    status: res.statusCode,
    ok: res.statusCode >= 200 && res.statusCode < 300,
    json: parsed,
    raw: text,
  };
}

async function rotateShareToken() {
  const rpc = 'rotate_results_share_token';
  const url = `${SUPABASE_URL}/rest/v1/rpc/${rpc}`;

  const headers: Record<string, string> = {
    apikey: ANON,
    'Content-Type': 'application/json',
    Authorization: `Bearer ${USER_JWT}`,
  };

  const body = JSON.stringify({ p_session_id: SESSION_ID });

  const res = await request(url, { method: 'POST', headers, body });
  const text = await res.body.text();

  let parsed: any;
  try { parsed = JSON.parse(text); } catch { /* leave as text */ }

  return {
    status: res.statusCode,
    ok: res.statusCode >= 200 && res.statusCode < 300,
    json: parsed,
    raw: text,
  };
}

(async () => {
  let failures = 0;

  if (mode === '--token' || mode === '--all') {
    if (!SHARE_TOKEN) {
      console.error('Missing SHARE_TOKEN for token path');
      failures++;
    } else {
      const out = await callRpc('token');
      console.log('\n=== TOKEN PATH ===');
      console.log('HTTP', out.status);
      console.log('Body', out.json ?? out.raw);
      if (!out.ok) failures++;
    }
  }

  if (mode === '--owner' || mode === '--all') {
    if (!USER_JWT) {
      console.error('Missing USER_JWT for owner path');
      failures++;
    } else {
      const out = await callRpc('owner');
      console.log('\n=== OWNER PATH ===');
      console.log('HTTP', out.status);
      console.log('Body', out.json ?? out.raw);
      if (!out.ok) failures++;
    }
  }

  if (mode === '--rotate') {
    if (!USER_JWT || !SHARE_TOKEN) {
      console.error('Missing USER_JWT or SHARE_TOKEN for rotate path');
      failures++;
    } else {
      const rotate = await rotateShareToken();
      console.log('\n=== ROTATE TOKEN ===');
      console.log('HTTP', rotate.status);
      console.log('Body', rotate.json ?? rotate.raw);

      const newToken = rotate.json?.share_token;
      if (!rotate.ok || typeof newToken !== 'string') {
        failures++;
      } else {
        const oldAttempt = await callRpc('token');
        console.log('\n-- Old token attempt --');
        console.log('HTTP', oldAttempt.status);
        if (oldAttempt.ok) failures++;

        const newAttempt = await callRpc('token', newToken);
        console.log('\n-- New token attempt --');
        console.log('HTTP', newAttempt.status);
        console.log('Body', newAttempt.json ?? newAttempt.raw);
        if (!newAttempt.ok) failures++;
      }
    }
  }

  if (failures > 0) {
    console.error(`\nSmoke failed with ${failures} error(s).`);
    process.exit(1);
  } else {
    console.log(`\n${mode === '--rotate' ? 'Rotate smoke OK' : 'Smoke OK'} ✅`);
  }
})().catch((e) => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
