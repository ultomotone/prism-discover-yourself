# Backfill Prechecks - Staging Apply

**Timestamp**: 2025-09-17T18:05:00Z  
**Environment**: Staging  
**Since Date**: 2025-08-01  

## Plan Verification ✅

### Backfill Plan Loaded
- **Source**: jobs/backfill_apply.plan.json
- **Version**: v1.0  
- **Total Candidates**: 39 sessions
- **Throttle**: 20/min (3-second intervals)
- **Expected Runtime**: ~2 minutes

### Batch Summary
1. **Priority**: 2 test sessions (618c5ea6, 070d9bf2)
2. **Recent September**: 5 sessions from Sept 2025
3. **August Backlog**: 32 sessions from Aug 2025

## Database State Snapshot

### RLS Status - Confirmed Active ✅
- **fc_scores**: RLS enabled, service role can write
- **profiles**: RLS enabled, service role can write  
- **assessment_sessions**: RLS enabled, service role can read

### Schema Drift Check ✅
- **fc_scores**: version column present (text)
- **profiles**: results_version column present (text)
- **assessment_sessions**: status, created_at columns verified

### Expected Changes
- **fc_scores**: +39 rows (version='v1.2', fc_kind='functions')
- **profiles**: +13 rows (results_version='v1.2.1')

## Safety Controls ✅

### Idempotent Operations
- score_fc_session: handles existing FC scores gracefully
- score_prism: handles existing profiles gracefully

### Rollback Strategy
- fc_scores: DELETE WHERE version='v1.2' AND created_at >= '2025-09-17T08:00:00Z'
- profiles: DELETE WHERE results_version='v1.2.1' AND created_at >= '2025-09-17T08:00:00Z'

## PRECHECK STATUS: ✅ PASS

All systems ready for staging backfill apply.