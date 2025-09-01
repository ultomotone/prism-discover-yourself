import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', override: true });
dotenv.config();

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
] as const;
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  throw new Error(
    `Missing env vars: ${missing.join(', ')}. Set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.`,
  );
}

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function runQuery(sql: string) {
  return fetch(`${SUPABASE_URL}/rest/v1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
    },
    body: JSON.stringify({ query: sql }),
  }).then(async (res) => {
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  });
}

async function main() {
  const exposure = execSync('rg -l SUPABASE_SERVICE_ROLE_KEY src || true', {
    encoding: 'utf8',
  }).trim();
  if (exposure) {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY found in client files:\n${exposure}`,
    );
  }

  const latest = await runQuery(
    'select fit_value, overlay, overlay_state from public.v_latest_assessments_v11 limit 5;',
  );
  if (!Array.isArray(latest) || latest.length === 0) {
    throw new Error('v_latest_assessments_v11 returned no rows');
  }
  for (const row of latest) {
    if (row.fit_value == null || Number.isNaN(Number(row.fit_value))) {
      throw new Error('invalid fit_value');
    }
  }

  const kpi = await runQuery('select * from public.v_kpi_overview_30d_v11;');
  if (!Array.isArray(kpi) || kpi.length === 0) {
    throw new Error('v_kpi_overview_30d_v11 returned no rows');
  }
  const k = kpi[0];
  const kpiFields = [
    'assessments_30d',
    'avg_fit_score',
    'hi_mod_conf_pct',
    'high_band_pct',
    'low_band_pct',
  ];
  for (const f of kpiFields) {
    if (k[f] == null || Number.isNaN(Number(k[f]))) {
      throw new Error(`kpi field ${f} invalid`);
    }
  }

  const distinct = await runQuery(
    "select count(distinct fit_value) as c from public.v_latest_assessments_v11 where when_ts >= now() - interval '48 hours';",
  );
  if (Number(distinct[0]?.c || 0) < 4) {
    throw new Error('fit_value not varied');
  }

  console.log('smoke checks passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
