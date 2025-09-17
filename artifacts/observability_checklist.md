# Version Alignment Observability Checklist

## Telemetry Events Added ✅

### engine_version_override
- **Event**: `evt:engine_version_override`
- **Fields**: 
  - `db_version`: Value from scoring_config
  - `engine_version`: Hardcoded engine version (v1.2.1)
  - `session_id`: Assessment session ID
- **Location**: `supabase/functions/score_prism/index.ts:143-145`
- **Trigger**: When database config ≠ engine expectation

## Monitoring Setup Required

### Alerts to Configure
1. **Version Override Alert**
   - **Condition**: `engine_version_override` events > 0 in production
   - **Severity**: WARNING  
   - **Duration**: Should be 0 after alignment completion
   - **Action**: Investigate configuration drift

2. **FC Legacy Fallback Alert**
   - **Condition**: `evt:fc_fallback_legacy` increase
   - **Severity**: INFO
   - **Action**: Monitor for unexpected legacy usage

### Log Monitoring
- **Platform**: Supabase Edge Function Logs
- **Search Terms**: 
  - `evt:engine_version_override`
  - `evt:fc_scores_loaded` (success path)
  - `evt:fc_fallback_legacy` (fallback path)

## Expected Baseline (Post-Change)
- **engine_version_override**: 0 events (database and engine aligned)
- **fc_scores_loaded**: Standard for FC assessments
- **fc_fallback_legacy**: Rare (legacy mapping only for edge cases)

## Verification Commands
```bash
# Check function logs for version events
supabase functions logs score_prism --filter="evt:engine_version_override"

# Verify scoring still works
supabase functions invoke finalizeAssessment --body='{"session_id":"test-session"}'
```

## Success Criteria
- ✅ No version override events in normal operation
- ✅ FC pipeline uses v1.2 consistently  
- ✅ Profiles stamped with results_version = "v1.2.1"
- ✅ Admin utilities maintain functionality