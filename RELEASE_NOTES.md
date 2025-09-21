# Release Notes

## 2025-01-16 – PRISM staged rollout preparation

### Summary
- Locked the production paywall flag to `VITE_PAYWALL_ENABLED=false` and confirmed shared `RESULTS_VERSION` exposure for parity with backend scoring release artifacts.
- Standardized deployment tooling with explicit Supabase Edge Function deployment coverage and a prod-grade web deploy command.
- Documented CI verification gates (lint, unit, e2e, parity) as a release prerequisite.

### Rollback Plan
- Previous Supabase Edge Function versions remain available; redeploy prior revisions with `npm run deploy:functions -- --linked-function <name>@<version>` if regressions surface.
- Restore the prior frontend build via your hosting provider's rollback (e.g., `vercel rollback <deployment-id>`).
- Database migrations in this release are backward compatible; no destructive operations were introduced, so reverting code is sufficient.
- Ensure `VITE_PAYWALL_ENABLED` is reset to `false` if an inadvertent toggle occurs during rollback.
