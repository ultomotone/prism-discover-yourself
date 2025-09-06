import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  console.error('SUPABASE_URL is not set.');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set.');
  process.exit(1);
}

export const admin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
