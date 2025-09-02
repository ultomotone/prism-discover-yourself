const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
  console.warn(`[ci-guard] Skipping check: missing ${missing.join(', ')}`);
  process.exit(1);
}
