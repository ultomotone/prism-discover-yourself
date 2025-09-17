# Version Alignment Apply Plan

## Status: PRECHECKS COMPLETED ✅

### Fresh Findings vs Previous Audit
- **Database**: `scoring_config.results_version = "v1.1.2"` (MATCHES audit)
- **Shared Libraries**: Both `calibration.ts` and `config.ts` at `v1.2.0` (MATCHES audit)  
- **Engine Override**: `score_prism` hardcodes `v1.2.1` as protection (MATCHES audit)
- **Golden Tests**: Already at `v1.2.1` (CONFIRMED)
- **No Codex Conflicts**: Clean commit history scan (VERIFIED)

### Target Changes
1. **Database Update**: `results_version: "v1.1.2" → "v1.2.1"`
2. **Shared Libraries**: `v1.2.0 → v1.2.1` (calibration.ts:35, config.ts:77)
3. **Engine Override Policy**: `keep_with_metric` (emit telemetry on mismatch)

### Risk Assessment
- **Functional Impact**: NONE (engine already overrides to v1.2.1)
- **Breaking Changes**: NONE (version strings only)
- **Rollback Time**: < 5 minutes (restore prior values)

### Verification Strategy
- Test finalizeAssessment flow post-change
- Confirm profiles.results_version = "v1.2.1"
- Verify FC pipeline uses v1.2 (no legacy fallback)
- Check admin utilities still function

## Ready for DRY-RUN Phase
Awaiting approval to prepare database migration and code changes.