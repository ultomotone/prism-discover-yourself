# Phase 2 Transition Guide - Single Write Mode

## Overview
This guide covers transitioning from dual-write (Phase 1) to single-write mode (Phase 2) for the unified scoring system.

## Pre-Transition Checklist

### 1. Verify Data Completeness
```sql
-- Check migration completeness
SELECT * FROM get_scoring_health();

-- Verify no sessions are missing unified results
SELECT COUNT(*) FROM get_sessions_missing_unified_results();
-- Should be 0 or very close to 0
```

### 2. Performance Baseline
Monitor these metrics in production logs:
- `persistResultsV3_unified_success` - write performance
- `results.unified_cache_hit` - read performance  
- `results.version_mismatch_recompute` - version consistency

### 3. Run Backfill if Needed
```bash
# If any sessions are missing
POST /functions/v1/admin-backfill-scoring_results
```

## Transition Steps

### Step 1: Enable Single-Write Mode
Set environment variable:
```bash
PRISM_WRITE_EXPLODED=false
```

### Step 2: Monitor (24-48 hours)
Watch for:
- Error rates in edge function logs
- Performance degradation  
- Any legacy table access patterns

Key metrics to track:
```javascript
// Good patterns in logs
persistResultsV3_complete: { total_ms: <50, served_from_cache: false }
results.unified_cache_hit: { served_from_cache: true }

// Warning patterns
persistResultsV3_unified_failed: // Should be 0
results.unified_cache_miss: // Should decrease over time
```

### Step 3: Verify All Reads Use Unified Path
Search codebase for direct legacy table access:
```bash
# Should return minimal results after transition
grep -r "scoring_results_types\|scoring_results_functions\|scoring_results_state" src/
```

## Smoke Tests

### Test 1: New Assessment Flow
1. Complete a new assessment
2. Verify row appears in `scoring_results` only
3. Check legacy tables remain unchanged
4. Verify results load correctly via `get-results-by-session`

### Test 2: Version Consistency
1. Update scoring version in config
2. Request existing results 
3. Verify recomputation triggered (`results.version_mismatch_recompute` log)
4. Verify updated `scoring_version` in database

### Test 3: Cache Performance
1. Request same results multiple times
2. Verify `results.unified_cache_hit` on subsequent calls
3. Check `served_from_cache: true` in logs

## Rollback Procedure

### If Issues Detected:
1. **Immediate**: Set `PRISM_WRITE_EXPLODED=true`
2. **Temporary**: Update `get-results-by-session` to prioritize legacy RPC
3. **Investigate**: Check logs for root cause
4. **Fix**: Address issues in unified path
5. **Retry**: Transition when stable

### Emergency Rollback Code:
```typescript
// Temporary: prioritize legacy path in get-results-by-session
const USE_LEGACY_FIRST = true;
if (USE_LEGACY_FIRST) {
  // Call legacy RPC first, unified as fallback
}
```

## Post-Transition Cleanup (After 30+ Days)

### Optional: Restrict Legacy Table Access
```sql
-- Prevent accidental legacy writes
REVOKE INSERT, UPDATE, DELETE ON scoring_results_types FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON scoring_results_functions FROM anon, authenticated; 
REVOKE INSERT, UPDATE, DELETE ON scoring_results_state FROM anon, authenticated;
-- Keep SELECT for verification queries
```

### Optional: Archive Legacy Tables
```sql
-- Example: rename for archival
ALTER TABLE scoring_results_types RENAME TO scoring_results_types_legacy;
-- Or drop if confident
-- DROP TABLE scoring_results_types;
```

## Monitoring Dashboard Queries

### Key Metrics View:
```sql
-- Performance overview
SELECT 
  scoring_version,
  COUNT(*) as total_results,
  AVG(EXTRACT(epoch FROM (now() - computed_at))/3600) as avg_age_hours,
  COUNT(DISTINCT user_id) as unique_users
FROM scoring_results 
WHERE computed_at >= now() - interval '7 days'
GROUP BY scoring_version
ORDER BY total_results DESC;
```

### Health Check:
```bash
GET /functions/v1/health-check-scoring
```

---

**Critical Success Metrics:**
- ✅ No `persistResultsV3_unified_failed` errors
- ✅ High cache hit rate (>80%) after 24h
- ✅ Response times <200ms for cached results
- ✅ Zero direct legacy table writes in logs
- ✅ All assessments flowing through unified path