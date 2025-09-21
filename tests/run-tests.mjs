#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_FILES = [
  'tests/fetchResults.test.ts',
  'tests/results.integration.test.ts',
  'tests/results.page.rpc-contract.test.tsx',
  'tests/linkSessionsToUser.test.ts',
  'tests/linkSessionToAccount.test.ts',
  'tests/assessmentApi.test.ts',
  'tests/dashboardUtils.test.ts',
  'tests/recompute.invoke.test.ts',
  'tests/resultsLink.test.ts',
  'tests/resultsVersion.test.ts',
  'tests/top3.fallback.test.ts',
  'tests/backfillProfiles.test.ts',
  'tests/systemStatus.test.ts',
  'tests/individualsPage.test.tsx',
  'tests/organizationsPage.test.tsx',
  'tests/serviceCard.test.tsx',
  'tests/paywall.guard.test.tsx',
  'tests/tiktokCapi.test.ts',
  'tests/tiktokClient.test.ts',
  'tests/linkedinCapiPayload.test.ts',
  'tests/linkedinTrack.test.ts',
  'tests/quoraCapiPayload.test.ts',
  'tests/quoraEvents.test.ts',
  'tests/redditConfig.test.ts',
  'tests/getUserJwt.test.ts',
  'tests/classifyRpcError.test.ts',
  'tests/saveResponseIdempotent.test.ts',
  'tests/retake.limits.test.ts',
  'supabase/functions/_shared/score-engine/__tests__/score-engine.test.ts',
  'tests/resultsLink.security.test.ts',
  'tests/finalizeAssessment.flow.test.ts',
];

const PATTERN_HINTS = [
  {
    files: ['tests/results.page.rpc-contract.test.tsx'],
    testNames: [
      'Results page → RPC contract + render: calls RPC with { p_session_id, t } and renders with token present',
      'Results page → RPC contract + render: passes t:null when no token param is present',
      'Results page → RPC contract + render: shows error state when backend returns null profile',
    ],
  },
  {
    files: ['tests/top3.fallback.test.ts'],
    testNames: [
      'getTop3List uses top_types when present',
      'getTop3List falls back to top_3_fits when top_types missing',
      'getTop3List falls back to primary type when both missing',
    ],
  },
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function translateArgs(rawArgs) {
  const output = [];
  let pattern;
  for (let i = 0; i < rawArgs.length; i += 1) {
    const arg = rawArgs[i];
    if (arg === '-t') {
      const parts = [];
      let j = i + 1;
      while (j < rawArgs.length && !rawArgs[j].startsWith('-')) {
        parts.push(rawArgs[j]);
        j += 1;
      }
      if (parts.length === 0) {
        console.error('Missing pattern after -t');
        process.exit(1);
      }
      const next = parts.join(' ');
      output.push('--test-name-pattern', escapeRegex(next));
      pattern = next;
      i = j - 1;
      continue;
    }
    if (arg.startsWith('-t=')) {
      const next = arg.slice(3);
      if (!next) {
        console.error('Missing pattern after -t=');
        process.exit(1);
      }
      output.push('--test-name-pattern', escapeRegex(next));
      pattern = next;
      continue;
    }
    if (arg === '--test-name-pattern') {
      const parts = [];
      let j = i + 1;
      while (j < rawArgs.length && !rawArgs[j].startsWith('-')) {
        parts.push(rawArgs[j]);
        j += 1;
      }
      if (parts.length === 0) {
        console.error('Missing pattern after --test-name-pattern');
        process.exit(1);
      }
      const next = parts.join(' ');
      output.push('--test-name-pattern', next);
      pattern = next;
      i = j - 1;
      continue;
    }
    if (arg.startsWith('--test-name-pattern=')) {
      const next = arg.split('=')[1];
      if (!next) {
        console.error('Missing pattern after --test-name-pattern=');
        process.exit(1);
      }
      output.push('--test-name-pattern', next);
      pattern = next;
      continue;
    }
    output.push(arg);
  }
  return { args: output, pattern };
}

function pickTestFiles(pattern) {
  if (!pattern) {
    return TEST_FILES;
  }

  let regex;
  try {
    regex = new RegExp(pattern);
  } catch (error) {
    regex = undefined;
  }

  const lowered = pattern.toLowerCase();
  for (const hint of PATTERN_HINTS) {
    const matches = hint.testNames.some((name) => {
      if (regex && regex.test(name)) {
        return true;
      }
      return name.toLowerCase().includes(lowered);
    });
    if (matches) {
      return hint.files;
    }
  }

  return TEST_FILES;
}

const { args: forwardedArgs, pattern } = translateArgs(process.argv.slice(2));
const filesToRun = pickTestFiles(pattern);

const c8Bin = path.resolve(__dirname, '../node_modules/c8/bin/c8.js');
const tsxBin = path.resolve(__dirname, '../node_modules/tsx/dist/cli.mjs');

const result = spawnSync(
  process.execPath,
  [c8Bin, tsxBin, '--test', '--test-force-exit', ...forwardedArgs, ...filesToRun],
  {
    stdio: 'inherit',
  }
);

if (result.error) {
  console.error(result.error);
  process.exit(typeof result.status === 'number' ? result.status : 1);
}

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(0);
