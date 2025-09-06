import { z } from 'zod';

const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SMOKE_SESSION_ID',
  'SMOKE_SHARE_TOKEN',
] as const;

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const url = `${process.env.SUPABASE_URL}/functions/v1/get-results-by-session`;

async function main() {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      apikey: process.env.SUPABASE_ANON_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: process.env.SMOKE_SESSION_ID,
      shareToken: process.env.SMOKE_SHARE_TOKEN,
    }),
  });

  if (!res.ok) {
    console.error(`Unexpected status ${res.status}`);
    process.exit(1);
  }

  const json = await res.json();
  const schema = z.object({
    profile: z.object({ id: z.string() }).passthrough(),
    session: z.object({ id: z.string(), status: z.string() }),
  });
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    console.error('Invalid payload', parsed.error.flatten());
    process.exit(1);
  }
  console.log('smoke ok');
}

main().catch((e) => {
  console.error('smoke failed', e);
  process.exit(1);
});
