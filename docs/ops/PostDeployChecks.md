# Post-deploy checks

This runbook enumerates the automated and manual verification required immediately after deploying the staged PRISM rollout.

## Automated smoke suite

| Check | Command | Expected outcome |
| --- | --- | --- |
| Token guard regression | `npx playwright test e2e/results.token-guard.spec.ts` | Missing token blocks access; invalid token returns `401`; valid token renders results view. |
| Finalize idempotency | `npx playwright test e2e/finalize.idempotency.spec.ts` | Second finalize call reuses the existing profile and returns matching `RESULTS_VERSION`. |

> Run the suite with production credentials scoped to a disposable session token. Halt the rollout if either spec fails.

## Manual validation

1. Create a fresh assessment session in production.
2. Complete the full assessment flow.
3. Follow the redirect to `/results/:sessionId?t=<token>`.
4. Confirm the paywall guard is **disabled** (`VITE_PAYWALL_ENABLED=false`) and the full results view renders with no gated sections.

Document outcomes (screenshots + notes) in the release ticket before moving on to observability checks.

## Observability follow-up

- Tail Supabase Edge Function logs for `assessment.completed` and `scoring.completed` events; each event must emit `RESULTS_VERSION` and `attempt_no`.
- Monitor the `results.rpc.failure` metric/alert. The acceptable threshold post-deploy is near-zero sustained errors (single transient spike < 1 minute is tolerable).
- Snapshot and archive dashboards or saved queries that visualize the above signals so on-call responders can reference the deployment baseline.

Escalate to the incident channel if any signal deviates from the documented expectations.
