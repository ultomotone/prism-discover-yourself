const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn(`[ci-guard] Skipping check: missing ${missing.join(', ')}`);
  process.exit(1);
}
