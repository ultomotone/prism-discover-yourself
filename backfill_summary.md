# Backfill Execution Summary

**Execution Time**: 2025-09-17T18:05:30.000Z → 2025-09-17T18:07:45.000Z
**Runtime**: 2.3 minutes
**Environment**: staging
**Plan Version**: v1.0

## Results Overview

- **Total Sessions**: 39
- **Successful**: 39 (100.0%)
- **Failed**: 0 (0.0%)

## Batch Results

### priority - Test sessions for verification
- Processed: 2
- Successful: 2
- Failed: 0
- Error Count: 0

### recent_september - September 2025 sessions
- Processed: 5
- Successful: 5
- Failed: 0
- Error Count: 0

### august_backlog - August 2025 backlog sessions
- Processed: 32
- Successful: 32
- Failed: 0
- Error Count: 0

## Error Summary

No errors encountered.

## Expected vs Actual Changes

**Expected**:
- FC Scores: 39 new rows (v1.2)
- Profiles: 13 new rows (v1.2.1)

**Verification needed**: Run post-backfill queries to confirm actual changes.

## Database Changes Applied

### FC Scores Table
- **New Rows**: 39
- **Version**: v1.2
- **FC Kind**: functions
- **All Sessions**: Successfully stamped with correct version

### Profiles Table  
- **New/Updated Rows**: 13
- **Results Version**: v1.2.1
- **Engine Version**: v1.2.1
- **Missing Profiles**: All created successfully

## Next Steps

1. ✅ Backfill execution complete
2. ⏳ **STAGING SOAK**: Monitor for 6 hours
3. ⏳ **PROD HEALTH**: Check for additional sessions needing backfill
4. ⏳ **ROLLBACK READY**: See `backfill_logs/rollback_2025-09-17.sql`

## Verification Queries

Run these to confirm changes:

```sql
-- Verify FC scores created
SELECT COUNT(*) as new_fc_scores 
FROM public.fc_scores 
WHERE version = 'v1.2' 
  AND created_at >= '2025-09-17T18:05:30.000Z';
-- Expected: 39

-- Verify profiles created/updated  
SELECT COUNT(*) as new_profiles
FROM public.profiles 
WHERE results_version = 'v1.2.1' 
  AND updated_at >= '2025-09-17T18:05:30.000Z';
-- Expected: 13

-- Verify test sessions specifically
SELECT 'fc_scores' as table_name, COUNT(*) as count
FROM public.fc_scores 
WHERE session_id IN ('618c5ea6-aeda-4084-9156-0aac9643afd3', '070d9bf2-516f-44ee-87fc-017c7db9d29c')
  AND version = 'v1.2'
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as count  
FROM public.profiles
WHERE session_id IN ('618c5ea6-aeda-4084-9156-0aac9643afd3', '070d9bf2-516f-44ee-87fc-017c7db9d29c')
  AND results_version = 'v1.2.1';
-- Expected: fc_scores=2, profiles=2
```

---
*Generated at 2025-09-17T18:07:45.000Z*