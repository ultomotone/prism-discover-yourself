# Release Notes

## 2025-01-16 – PRISM Staged Rollout

### Summary
- Feature flag audit: confirm `VITE_PAYWALL_ENABLED=false` in production and expose `RESULTS_VERSION` from the shared module for coordinated verification with backend scoring artifacts.
- Standardized deployment tooling for Supabase Edge Functions (`finalizeAssessment`, `get-results-by-session`, `score_prism`, `score_fc_session`) and a production web deploy (e.g., Vercel).
- CI quality gates: lint, unit, e2e, and parity suites must be green before promotion.

### Rollout Order
1. Apply database migrations (08 → latest) to production.
2. Deploy Supabase Edge Functions (ensure JWT is enforced except for endpoints explicitly designed for public/share-token access).
3. Deploy the frontend through the production pipeline.
4. Clear any CDN caches for `/results` and `/assessment` if applicable.

### Post-Deploy Checks
- Token guard: missing/invalid token is blocked; valid share link renders results anonymously.
- Finalize idempotency: a second finalize call reuses the existing profile; `RESULTS_VERSION` matches expectations.
- Spot-check owner vs share flows (logged-in owner, incognito share).

### Observability
- Verify `assessment.completed` and `scoring.completed` logs include `RESULTS_VERSION` and `attempt_no`.
- Monitor `results.rpc.failure`; acceptable is near-zero after stabilization.
- Save/update dashboards and queries for these signals.

### Rollback Plan
- Supabase retains previous Edge Function versions; redeploy the prior known-good revision if regressions occur (optionally via `npm run deploy:functions -- --linked-function <name>@<version>` if you tag versions).
- Roll the web app back via the hosting provider (e.g., `vercel rollback <deployment-id>`).
- Database migrations in this batch are backward compatible; pause further migrations and apply a corrective migration if needed.
- If the paywall was toggled inadvertently, reset `VITE_PAYWALL_ENABLED=false` and redeploy the frontend.
