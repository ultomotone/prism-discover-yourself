import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    'Supabase admin client requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

export const admin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
