# Staging Rollback Plan

## Overview
This document provides the rollback procedures for staging environment in case of issues during or after v1.2.1 version alignment.

## Current State Backup
- **Baseline captured**: `stage_version_baseline.json`
- **Timestamp**: 2025-09-17T03:30:00Z
- **Pre-change state**: DB configured as v1.2.1 but scoring pipeline broken

## Rollback Procedures

### 1. Database Configuration Rollback

#### Immediate Rollback (< 5 minutes)
```sql
-- Rollback scoring_config to v1.2.0
UPDATE scoring_config 
SET value = '"v1.2.0"'::jsonb,
    updated_at = now()
WHERE key = 'results_version';

-- Verify rollback
SELECT key, value, updated_at 
FROM scoring_config 
WHERE key = 'results_version';
```

#### Full Configuration Restore
```sql
-- If other config values were changed, restore from baseline
-- (Add specific config rollbacks here if changes were made)

-- Verify all configurations
SELECT key, value, updated_at 
FROM scoring_config 
ORDER BY key;
```

### 2. Edge Functions Rollback

#### Code Deployment Rollback
```bash
# If code changes were deployed, rollback to previous commit
git checkout <previous_commit_hash>

# Or rollback to specific branch
git checkout main

# Redeploy edge functions
# (This would be handled by your CI/CD pipeline)
```

#### Specific Function Rollbacks
- **finalizeAssessment**: Revert any v1.2.1 specific changes
- **score_prism**: Restore v1.2.0 engine parameters  
- **score_fc_session**: Revert to v1.1/v1.2 FC handling

### 3. Data Rollback Considerations

#### Profiles Table
```sql
-- Check for any profiles created with v1.2.1 during testing
SELECT id, session_id, results_version, version, created_at
FROM profiles 
WHERE results_version = 'v1.2.1' OR version = 'v1.2.1'
ORDER BY created_at DESC;

-- If test profiles were created and need removal:
-- DELETE FROM profiles WHERE results_version = 'v1.2.1' AND created_at > 'ROLLBACK_TIMESTAMP';
```

#### FC Scores Table  
```sql
-- Check for any v1.2 FC scores created during testing
SELECT session_id, version, created_at
FROM fc_scores 
WHERE version = 'v1.2' AND created_at > '2025-09-17T03:30:00Z'
ORDER BY created_at DESC;

-- If test FC scores need removal:
-- DELETE FROM fc_scores WHERE version = 'v1.2' AND created_at > 'ROLLBACK_TIMESTAMP';
```

### 4. Verification Steps Post-Rollback

#### Database Verification
```sql
-- Confirm rollback success
SELECT 
  'results_version' as config_key,
  value,
  CASE 
    WHEN value = '"v1.2.0"'::jsonb THEN 'ROLLBACK SUCCESS'
    ELSE 'ROLLBACK FAILED'
  END as status
FROM scoring_config 
WHERE key = 'results_version';
```

#### Function Testing
```bash
# Test that scoring functions work with v1.2.0
curl -X POST "${STAGING_URL}/functions/v1/finalizeAssessment" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test_session_id"}'
```

#### Profile Generation Test
- Create new test session  
- Complete with minimal responses
- Verify profile generated with v1.2.0

## Risk Assessment

### Low Risk Rollbacks
- Database configuration changes (immediate effect)
- Edge function deployments (if no schema changes)

### Medium Risk Rollbacks  
- Profile data cleanup (if test data was created)
- FC scores cleanup (if new records created)

### High Risk Rollbacks
- **Not applicable currently** - no schema changes planned

## Recovery Time Objectives

| Component | RTO Target | Procedure |
|-----------|------------|-----------|
| DB Config | < 2 minutes | Single UPDATE statement |
| Edge Functions | < 5 minutes | Code revert + redeploy |
| Data Cleanup | < 10 minutes | Targeted DELETE statements |
| Full Verification | < 15 minutes | Complete testing cycle |

## Emergency Contacts & Escalation

### Immediate Actions (Anyone)
1. Execute database rollback SQL
2. Check basic functionality  
3. Document issues encountered

### Escalation Triggers
- Rollback SQL fails to execute
- Functions still failing after rollback
- Data inconsistencies detected
- Performance degradation continues

## Post-Rollback Analysis

### Required Documentation
1. **Rollback timestamp** and duration
2. **Issues encountered** during rollback
3. **Data affected** (if any)
4. **Root cause** of original failure
5. **Prevention measures** for future attempts

### Success Criteria
- [ ] Database shows results_version = v1.2.0
- [ ] Edge functions operational  
- [ ] No scoring errors in logs
- [ ] Test session completes successfully
- [ ] All pre-rollback functionality restored

## Notes

**Current Issue Context**: 
- Staging already has broken scoring pipeline
- Rollback may not fix existing issues (profiles not generating)
- Focus should be on fixing underlying scoring problems first
- Version alignment secondary to basic functionality

**Recommendation**: 
Fix scoring pipeline issues before attempting version alignment again.