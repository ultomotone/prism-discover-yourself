import { readdirSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', override: true });
dotenv.config();

const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  throw new Error(
    `Missing env vars: ${missing.join(', ')}. Set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.`,
  );
}

const base = path.resolve('supabase/functions');
const dirs = readdirSync(base, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => d.name);

try {
  for (const dir of dirs) {
    console.log(`compiling ${dir}`);
    let attempt = 0;
    while (attempt < 2) {
      try {
        execSync(`npx -y deno check supabase/functions/${dir}/index.ts`, {
          stdio: 'inherit',
        });
        break;
      } catch (e) {
        attempt++;
        if (attempt >= 2) {
          console.error(
            'function compile failed. If this is a TLS error, check CA certificates or proxy settings.',
          );
          throw e;
        }
        console.log('retrying...');
      }
    }
  }
  console.log('all functions compiled');
} catch (e) {
  console.error('function compile failed', e);
  process.exit(1);
}
