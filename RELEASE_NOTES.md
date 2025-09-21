# Release Notes

## PRISM Staged Rollout

### Summary
- Feature flag audit: confirm `VITE_PAYWALL_ENABLED=false` in production and expose `RESULTS_VERSION` from the shared module for coordinated verification.
- Deployment assets: publish Supabase Edge Functions (`finalizeAssessment`, `get-results-by-session`, `score_prism`, `score_fc_session`) with JWT verification disabled at deploy time and ship the React frontend through the production Vercel pipeline.
- CI quality gates: lint, unit, e2e, and parity suites must be green before promotion.

### Rollback Plan
1. Supabase automatically retains the previous Edge Function versions; redeploy the prior known-good build if errors occur.
2. Roll the web app back via the hosting provider (e.g., `vercel rollback` to the previous deployment URL).
3. Database migrations in this release are backward compatible; if issues surface, pause new migrations and apply a corrective migration if necessary.
4. If the paywall is toggled inadvertently, immediately reset `VITE_PAYWALL_ENABLED=false` and redeploy the frontend.
