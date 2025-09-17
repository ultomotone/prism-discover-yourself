# Staging Environment Analysis & Diff Report

## Current State Assessment (2025-09-17)

### ✅ ALIGNED COMPONENTS
- **Database Configuration**: `scoring_config.results_version = "v1.2.1"` ✅
- **Security Functions**: `get_profile_by_session` exists with `SECURITY DEFINER` ✅
- **Share Token Infrastructure**: All 475 sessions have valid share tokens ✅

### ❌ CRITICAL ISSUES IDENTIFIED

#### 1. Scoring Pipeline Failure
- **Recent Completed Session**: `618c5ea6-aeda-4084-9156-0aac9643afd3`
  - Completed: 2025-09-16 22:32:24
  - Finalized: 2025-09-16 22:32:24  
  - Responses: 248 questions answered
  - **Issue**: No profile generated despite completion
  
#### 2. FC Scoring Complete Absence
- **FC Scores**: 0 total records in `fc_scores` table
- **Impact**: Critical for v1.2.1 scoring methodology
- **Status**: BLOCKING - FC scoring pipeline non-functional

#### 3. Profile Version Mismatch  
- **All Profiles**: 131 profiles with `version = "v1.2.0"`
- **No v1.2.1 Profiles**: Despite DB config showing v1.2.1
- **Latest Profile**: 2025-08-27 (20+ days ago)
- **Gap**: Recent sessions not converting to profiles

## Root Cause Analysis

### Likely Issues
1. **Edge Functions**: `finalizeAssessment` or `score_prism` may be failing
2. **FC Pipeline**: `score_fc_session` appears completely non-functional  
3. **Version Alignment**: Scoring engine not reading v1.2.1 config correctly
4. **Database Permissions**: Possible RLS or permission issues blocking writes

### Evidence Points
- Sessions are being created and responses recorded ✅
- Sessions are being marked as "completed" and "finalized" ✅  
- But no profiles are generated from scoring ❌
- No FC scores are being created ❌

## Required Actions Before Version Alignment

### IMMEDIATE (BLOCKING)
1. **Test Scoring Functions**
   ```bash
   # Test finalizeAssessment with completed session
   curl -X POST "${STAGING_URL}/functions/v1/finalizeAssessment" \
     -H "Content-Type: application/json" \
     -d '{"session_id": "618c5ea6-aeda-4084-9156-0aac9643afd3"}'
   ```

2. **Check Edge Function Logs**
   - Review `finalizeAssessment` logs for errors
   - Check `score_prism` execution logs  
   - Verify `score_fc_session` functionality

3. **Verify FC Infrastructure**
   - Confirm `fc_blocks` and `fc_options` tables populated
   - Check if FC questions exist in assessment
   - Test FC response recording

### SECONDARY  
4. **Profile Generation Test**
   - Create new test session
   - Complete assessment end-to-end
   - Verify profile creation with v1.2.1

## Rollback Plan

Since the database is already configured for v1.2.1 but the pipeline is broken, rollback would involve:

### Database Rollback
```sql
UPDATE scoring_config 
SET value = '"v1.2.0"'::jsonb,
    updated_at = now()
WHERE key = 'results_version';
```

### Code Rollback
- Revert any v1.2.1 specific changes in edge functions
- Restore v1.2.0 scoring engine parameters

## Recommendation: HALT PROMOTION

**STATUS**: 🔴 **NOT READY FOR VERSION ALIGNMENT**

### Reasons
1. **Scoring Pipeline Broken**: Cannot generate profiles from completed sessions
2. **FC Scoring Missing**: Essential v1.2.1 component completely absent  
3. **Version Mismatch**: DB config doesn't match actual scoring behavior
4. **Data Gap**: 20+ day gap in profile generation indicates systemic issue

### Next Steps
1. **Fix Scoring Pipeline**: Address edge function failures
2. **Restore FC Scoring**: Implement/fix FC scoring functionality
3. **Test End-to-End**: Complete full assessment → profile flow
4. **Re-run Prechecks**: Verify all systems functional before promotion

### Success Criteria for Promotion
- [ ] Recent completed sessions generate profiles with v1.2.1
- [ ] FC scores are created for completed assessments  
- [ ] No scoring function errors in logs
- [ ] Test session completes end-to-end successfully
- [ ] Version alignment is functional, not just configurational

## Version Component Matrix (Current)

| Component | Target | Current | Status |
|-----------|--------|---------|--------|
| DB results_version | v1.2.1 | v1.2.1 | ✅ ALIGNED |
| Profile generation | v1.2.1 | FAILING | ❌ BROKEN |
| FC scoring | v1.2 | MISSING | ❌ MISSING |
| Edge functions | v1.2.1 | UNKNOWN | ❓ NEEDS TESTING |
| Security RPC | Required | ✅ Present | ✅ READY |
| Share tokens | Required | ✅ Present | ✅ READY |

**Overall Status**: 🔴 **CRITICAL ISSUES - HALT DEPLOYMENT**