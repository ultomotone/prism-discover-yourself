# PRISM Production Deployment Runbook

This runbook orchestrates a production rollout of the PRISM assessment and results stack. Follow the steps sequentially for a staged deployment, pausing between phases to confirm system health.

## Deployment Order
1. **Database migrations** – Apply migrations `0008` and onward through the current latest release. Verify the change set completes without destructive operations.
2. **Edge Functions** – Deploy `finalizeAssessment`, `get-results-by-session`, `score_prism`, and `score_fc_session` using `npm run deploy:functions` (ensures `--no-verify-jwt`).
3. **Frontend** – Promote the web bundle with `npm run deploy:web` once backend migrations and functions are healthy.
4. **CDN cache** – Invalidate cached content for `/results` and `/assessment` routes if a CDN is in front of the app.

## Post-deploy checks
Perform these checks immediately after deployment. Failures require halting rollout and investigating before continuing.

### Automated smoke
- `npm run test` – ensure the unit and integration suite passes.
- `npm run lint` and `npm run typecheck` – confirm the CI-quality gates stay green.
- Playwright suites:
  - `results.token-guard.spec`:
    - Missing token blocks access.
    - Invalid token returns unauthorized state.
    - Valid token renders full results.
  - `finalize.idempotency.spec`:
    - Second invocation reuses the existing profile rather than creating a duplicate.
    - Response exposes the expected `RESULTS_VERSION`.

### Manual validation
1. Create a fresh assessment session, complete the flow, and follow the redirect to `/results/:id?t=<token>`.
2. Confirm `VITE_PAYWALL_ENABLED=false` in the production environment so the paywall guard stays disabled.
3. Validate the results screen renders full insights without requiring payment.

### Observability
- Check Supabase Edge Function logs for `assessment.completed` and `scoring.completed` events; each should include `RESULTS_VERSION` and `attempt_no` values.
- Review error dashboards to verify `results.rpc.failure` remains near zero.
- Save or update logging dashboards and saved queries so responders can monitor rollout health quickly.

### Rollback readiness
- Previous Edge Function versions remain available in Supabase; redeploy if regressions appear.
- Revert the frontend via hosting provider tooling (e.g., `vercel rollback`).
- Database migrations in this release are backward compatible; no drops were introduced.
- If the paywall is toggled on inadvertently, reset `VITE_PAYWALL_ENABLED=false` and redeploy the web app.
