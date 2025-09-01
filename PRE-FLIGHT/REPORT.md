# Preflight Report

This report logs findings and fixes during ground-zero cleanup.

## Findings
- Initial scan pending.

## Fixes
- N/A


start_assessment ping error: TypeError: Failed to parse URL from /functions/v1/start_assessment
finalizeAssessment ping error: TypeError: Failed to parse URL from /functions/v1/finalizeAssessment
score_prism ping error: TypeError: Failed to parse URL from /functions/v1/score_prism

## Changes
- Added ground-zero SQL migration for PII-safe views and scoring defaults.
- Added preflight script to execute SQL and run verification queries.
- Added npm scripts for preflight tasks.

## Verification
- `npm run lint` reported TypeScript lint errors (see logs).
- `npm run verify:sql` executed but no Supabase environment configured.

## Run #1 - 2025-09-01T19:53:12.120Z
Executing SQL migration...
Fatal error: TypeError: fetch failed

## Run #2 - 2025-09-01T19:53:17.115Z
Executing SQL migration...
Fatal error: TypeError: fetch failed

## Run #3 - 2025-09-01T19:53:26.878Z
SQL execution skipped (--verify-only)
start_assessment ping error: TypeError: fetch failed
finalizeAssessment ping error: TypeError: fetch failed
score_prism ping error: TypeError: fetch failed

## verify:functions
npx -y deno check supabase/functions/... (failed: invalid peer certificate)

## verify:smoke
ENETUNREACH during fetch

## Run #4 - 2025-09-01T20:53:08+00:00
Preflight failed: Missing env vars
