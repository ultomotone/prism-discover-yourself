import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type Metrics = {
  [key: string]: unknown;
  rlsAnonSession?: number;
  rlsOwnerEmail?: string | null;
  scoringConfigAnon?: number;
};

dotenv.config({ path: '.env.local', override: true });
dotenv.config();

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
] as const;
const missing = required.filter((k) => !process.env[k]);

const reportPath = 'PRE-FLIGHT/REPORT.md';
const metricsPath = 'PRE-FLIGHT/metrics.json';

function getRunNumber(): number {
  if (!fs.existsSync(reportPath)) return 1;
  const content = fs.readFileSync(reportPath, 'utf8');
  const matches = content.match(/Run #/g);
  return (matches ? matches.length : 0) + 1;
}

if (missing.length) {
  throw new Error(
    `Missing env vars: ${missing.join(', ')}. Set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.`,
  );
}

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY = process.env.SUPABASE_ANON_KEY!;

async function executeSql(): Promise<number> {
  const sqlFile = path.resolve('sql/2025-ground0-clean.sql');
  const query = fs.readFileSync(sqlFile, 'utf8');
  const res = await fetch(`${SUPABASE_URL}/rest/v1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    throw new Error(`SQL error ${res.status}: ${await res.text()}`);
  }
  return res.status;
}

async function pingFunction(
  name: string,
  method: string,
  body?: unknown,
): Promise<number> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.status;
}

async function runQuery(sql: string): Promise<unknown> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    throw new Error(`query failed ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function testRls(
  _client: SupabaseClient,
  _admin: SupabaseClient,
  metrics: Metrics,
) {
  const id = crypto.randomUUID();
  await fetch(`${SUPABASE_URL}/rest/v1/assessment_sessions`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{ id, email: 'test@example.com' }]),
  });

  const anon = await fetch(
    `${SUPABASE_URL}/rest/v1/assessment_sessions?select=email&id=eq.${id}`,
    {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    },
  );
  metrics.rlsAnonSession = anon.status;

  const own = await fetch(
    `${SUPABASE_URL}/rest/v1/assessment_sessions?select=email&id=eq.${id}`,
    {
      headers: {
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
      },
    },
  );
  const ownJson = await own.json();
  metrics.rlsOwnerEmail = ownJson?.[0]?.email ?? null;

  const scAnon = await fetch(`${SUPABASE_URL}/rest/v1/scoring_config`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  metrics.scoringConfigAnon = scAnon.status;
}

async function main() {
  const verifyOnly = process.argv.includes('--verify-only');
  const runNumber = getRunNumber();
  const timestamp = new Date().toISOString();
  const report: string[] = [`## Run #${runNumber} - ${timestamp}`];
  const metrics: Metrics = {};
  const client = createClient(SUPABASE_URL, ANON_KEY);
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const funcs = ['start_assessment', 'finalizeAssessment', 'score_prism'];
  const queries: Record<string, string> = {
    distribution: `select
  min(score_fit_calibrated) as min_fit,
  max(score_fit_calibrated) as max_fit,
  avg(score_fit_calibrated) as avg_fit,
  stddev_samp(score_fit_calibrated) as sd_fit,
  count(*) as n
from public.profiles
where created_at >= now() - interval '30 days';`,
    latestVariety: `select fit_value, count(*)
from public.v_latest_assessments_v11
where when_ts >= now() - interval '48 hours'
group by 1 order by 2 desc;`,
    modelGuard: `select count(*) as invalid_flagged
from public.profiles
where coalesce(invalid_combo_flag,false) is true
  and created_at >= now() - interval '30 days';`,
    kpiAnon: `select * from public.v_kpi_overview_30d_v11;`,
    sharePct: `select count(*) filter (where (type_scores->(top_types->>0)->>'share_pct') is not null) as with_share,
       count(*) as total
from public.profiles
where created_at >= now() - interval '30 days';`,
    missingCal: `select count(*) as missing_calibrated
from public.profiles
where score_fit_calibrated is null
  and created_at >= now() - interval '30 days';`,
  };

  try {
    if (!verifyOnly) {
      report.push('Executing SQL migration...');
      await executeSql();
      report.push('SQL migration applied');
    } else {
      report.push('SQL execution skipped (--verify-only)');
    }

    for (const fn of funcs) {
      try {
        const opt = await pingFunction(fn, 'OPTIONS');
        const post = await pingFunction(fn, 'POST', {});
        report.push(`${fn} OPTIONS -> ${opt}`);
        report.push(`${fn} POST -> ${post}`);
      } catch (e) {
        report.push(`${fn} ping error: ${e}`);
      }
    }

    for (const [key, sql] of Object.entries(queries)) {
      try {
        metrics[key] = await runQuery(sql);
      } catch (e) {
        metrics[key] = { error: String(e) };
      }
    }

    await testRls(client, admin, metrics);

    const views = ['v_latest_assessments_v11', 'v_kpi_overview_30d_v11'];
    const viewStatus: Record<string, number> = {};
    for (const v of views) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${v}?limit=1`, {
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
        },
      });
      viewStatus[v] = res.status;
      report.push(`${v} anon access -> ${res.status}`);
    }
    metrics.viewStatus = viewStatus;
  } catch (e) {
    report.push(`Fatal error: ${e}`);
    fs.appendFileSync(reportPath, '\n' + report.join('\n') + '\n');
    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
    process.exit(1);
  }

  const summary = {
    sqlExecuted: !verifyOnly,
    functionsPinged: funcs.length,
    queriesRun: Object.keys(queries).length,
    viewsAnon: metrics.viewStatus,
  };
  report.push('Summary: ' + JSON.stringify(summary));

  fs.appendFileSync(reportPath, '\n' + report.join('\n') + '\n');
  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  console.log('Preflight summary', summary);
}

main();
