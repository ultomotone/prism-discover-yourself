# IR-04 — Profile Creation Gap Investigation  

**Status**: 🔴 **COMPLETE PROFILE GENERATION FAILURE**  
**Timestamp**: 2025-09-17T03:55:00Z  
**Environment**: Staging

## Profile Creation Timeline (Last 30 Days)

| Date | New Sessions | Completed Sessions | New Profiles | Conversion Rate | Status |
|------|-------------|-------------------|--------------|-----------------|--------|
| 2025-08-25 | ~130+ | ~130 | **127** | ~98% | 🟢 **HEALTHY** |
| 2025-08-26 | ~10+ | ~10 | **3** | ~30% | 🟡 **DECLINING** |
| 2025-08-27 | ~5+ | ~5 | **1** | ~20% | 🔴 **FAILING** |
| 2025-08-28 | Unknown | Unknown | **0** | 0% | 🔴 **BROKEN** |
| 2025-08-29 → 2025-09-16 | 40+ | Unknown | **0** | 0% | 🔴 **BROKEN** |

**Critical Finding**: **100% profile generation failure** for 20+ consecutive days

## Gap Analysis Details

### Last Successful Period (2025-08-25)
- **127 profiles created** in single day
- **Normal batch processing** pattern
- **High conversion rate** (~98%)
- **All profiles version**: v1.2.0

### Decline Period (2025-08-26 to 2025-08-27)  
- **Profile creation drops** from 127 → 3 → 1
- **Conversion rate plummets** from 98% → 30% → 20%
- **Indicates**: Progressive system failure

### Complete Failure Period (2025-08-28 onwards)
- **Zero profiles created** for 20+ days
- **40+ recent completed sessions** with no profiles
- **0% conversion rate** sustained
- **All sessions fail** to generate profiles

## Recent Session Analysis (No Profiles Generated)

### Test Case: Session 618c5ea6-aeda-4084-9156-0aac9643afd3
- **Completed**: 2025-09-16 22:32:24.089Z
- **Status**: completed + finalized ✅
- **Responses**: 248 total answers ✅
- **FC Responses**: 10+ forced-choice answers ✅  
- **Profile**: **NULL** ❌
- **FC Scores**: **NULL** ❌

### Pattern: All Recent Sessions
```sql
-- 40 sessions in last 7 days
-- 0 profiles generated  
-- 100% failure rate
```

**Evidence**: Every completed session since 2025-08-27 fails to generate a profile

## Correlation with System Changes

### Timeline Alignment
| Date | Event | Impact |
|------|-------|--------|
| 2025-08-25 | Normal operation | 127 profiles ✅ |
| 2025-08-26 | Unknown change | Drop to 3 profiles ⚠️ |
| 2025-08-27 | Critical change | Final profile generated ⚠️ |
| 2025-08-28+ | **System broken** | **Zero profiles** ❌ |

### Likely Root Cause Events (2025-08-27/28)
1. **RLS Policy Changes**: profiles table policies removed
2. **FC Infrastructure Migration**: fc_blocks/fc_options tables created but not populated  
3. **Code Deployment**: score_prism updated to require FC scores
4. **Configuration Change**: results_version updated without proper testing

## Session Processing Health Check

### What's Working ✅
- Session creation and response recording
- Session completion and finalization  
- finalizeAssessment function execution
- Basic scoring engine operation

### What's Failing ❌
- FC infrastructure queries (empty tables)
- Profile upsert operations (RLS blocking)
- fc_scores generation (no FC data)
- End-to-end scoring pipeline

## Error Pattern Analysis

### Silent Failures
- **No error logs** in edge function logs (only reddit-capi visible)
- **finalizeAssessment** silently ignores FC scoring errors
- **Database writes** fail without visible exceptions
- **RLS violations** not surfaced in application logs

### Expected Error Messages (Missing)
```typescript
// Should see but don't:
"evt:fc_scoring_start" - FC scoring initiated
"evt:fc_no_responses" - FC early return  
"evt:fc_fallback_legacy" - score_prism fallback
"evt:scoring_complete" - Profile generation success
"RLS policy violation" - Database write failures
```

## Impact Assessment

### Business Impact  
- **100% assessment failure** for profile generation
- **20+ days of lost data** (completed assessments without results)
- **User experience broken** (assessments complete but no results accessible)

### Technical Debt
- **40+ sessions** need profile backfill once fixed
- **Data integrity issues** from incomplete scoring
- **Version misalignment** between config (v1.2.1) and profiles (v1.2.0)

## Recovery Strategy

### Phase 1: Emergency Fix (IR-07)
1. **Restore RLS policies** for profiles table  
2. **Bypass FC scoring** temporarily
3. **Test single session** end-to-end
4. **Verify profile generation** working

### Phase 2: Backfill (IR-08)  
1. **Identify 40+ sessions** needing profiles
2. **Re-run score_prism** for each session
3. **Generate missing profiles** with v1.2.1 
4. **Validate data integrity**

### Phase 3: FC Infrastructure (Post-IR)
1. **Populate fc_blocks/fc_options** tables
2. **Migrate FC question data** 
3. **Enable proper FC scoring**
4. **Re-test complete pipeline**

## Success Metrics Post-Fix

- [ ] **Recent sessions generate profiles** (100% conversion)
- [ ] **No profile creation gaps** in timeline  
- [ ] **Proper version stamping** (v1.2.1)
- [ ] **FC scores generated** when infrastructure ready
- [ ] **End-to-end assessment completion** working

## Next Actions

**CRITICAL**: Execute IR-07 hotfix immediately to restore basic functionality  
**PRIORITY**: Run backfill process to recover 20+ days of lost profiles  
**STRATEGIC**: Address FC infrastructure for complete v1.2.1 functionality

---
**Stoplight Status**: 🔴 **CRITICAL - IMMEDIATE ACTION REQUIRED**  
**Root Cause**: RLS + FC infrastructure failures creating 100% profile generation failure  
**Timeline**: 20+ day complete outage, must fix immediately