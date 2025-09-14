import { createClient } from '@supabase/supabase-js';
import { appendFile } from 'node:fs/promises';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';
const AUTH_EMAIL = process.env.AUTH_EMAIL ?? '';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD ?? '';
const GITHUB_ENV = process.env.GITHUB_ENV;

const missing: string[] = [];
if (!SUPABASE_URL) missing.push('SUPABASE_URL');
if (!SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');
if (!AUTH_EMAIL) missing.push('AUTH_EMAIL');
if (!AUTH_PASSWORD) missing.push('AUTH_PASSWORD');

if (missing.length > 0) {
  console.error(`Missing env: ${missing.join(', ')}`);
  process.exit(1);
}

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

try {
  const { data, error } = await client.auth.signInWithPassword({
    email: AUTH_EMAIL,
    password: AUTH_PASSWORD,
  });

  if (error || !data.session) {
    console.error(`Failed to fetch user JWT: ${error?.message ?? 'no session'}`);
    process.exit(1);
  }

  const token = data.session.access_token;

  if (GITHUB_ENV) {
    await appendFile(GITHUB_ENV, `USER_JWT=${token}\n`);
    console.log(`::add-mask::${token}`);
  }

  console.log(token);
} catch (err) {
  console.error('Unhandled error:', err);
  process.exit(1);
}
