# IR-07 — Minimal Hotfix Plan (Staging Scoring Pipeline)

**Status**: 🔴 **READY FOR IMMEDIATE DEPLOYMENT**  
**Timestamp**: 2025-09-17T04:00:00Z  
**Environment**: Staging → Production

## Executive Summary

### Root Causes Identified
1. **🚨 CRITICAL**: `profiles` table has **NO RLS policies** → 100% write failures
2. **🚨 BLOCKING**: FC infrastructure empty (`fc_blocks`, `fc_options` = 0 records)  
3. **⚠️ SECONDARY**: Functions healthy, credentials correct, data processing works

### Impact  
- **20+ days** of complete profile generation failure (0% conversion)
- **40+ completed sessions** without profiles
- **100% assessment completion failure** for results generation

### Fix Strategy
**Minimal, safe, reversible changes** to restore basic functionality immediately.

## Hotfix Components

### 🔧 Fix A: Restore profiles Table RLS Policy
**Problem**: Service role cannot write to profiles (NO policies exist)  
**Solution**: Add service role write policy
**Risk**: LOW (only enables service role, no user access)
**Urgency**: CRITICAL

```sql
-- REQUIRED: Enable service role writes to profiles table
CREATE POLICY "Service role can manage profiles" 
ON public.profiles 
FOR ALL 
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
```

### 🔧 Fix B: Make FC Scoring Optional in score_prism
**Problem**: score_prism expects FC scores but infrastructure empty  
**Solution**: Enhance fallback logic to work without FC scores
**Risk**: LOW (maintains current behavior, improves robustness)
**Urgency**: HIGH

```typescript
// In supabase/functions/score_prism/index.ts:85-98
let fcScores: Record<string, number> | undefined;
const { data: fcRow } = await supabase
  .from("fc_scores")
  .select("scores_json")
  .eq("session_id", session_id)
  .eq("version", "v1.2")
  .eq("fc_kind", "functions")
  .maybeSingle();

if (fcRow?.scores_json) {
  fcScores = fcRow.scores_json as Record<string, number>;
  console.log(`evt:fc_scores_loaded,session_id:${session_id}`);
} else {
  // ENHANCED: Better fallback handling
  console.log(`evt:fc_fallback_legacy,session_id:${session_id},reason:no_fc_infrastructure`);
  fcScores = undefined; // Explicit undefined for scoreAssessment
}
```

### 🔧 Fix C: Improve Error Logging in finalizeAssessment
**Problem**: FC scoring errors silently ignored  
**Solution**: Add non-fatal error logging
**Risk**: MINIMAL (logging only)
**Urgency**: MEDIUM

```typescript
// In supabase/functions/finalizeAssessment/index.ts:28-35
// FC scoring (best-effort)
try {
  const fcResult = await supabase.functions.invoke("score_fc_session", {
    body: { session_id, version: "v1.2", basis: "functions" },
  });
  console.log(`evt:fc_scoring_attempted,session_id:${session_id},success:true`);
} catch (fcError: any) {
  // Log but don't fail - FC scoring is best-effort
  console.log(`evt:fc_scoring_attempted,session_id:${session_id},success:false,error:${fcError?.message || 'unknown'}`);
}
```

## Pre-Apply Verification

### Database State Check
```sql
-- Confirm current broken state
SELECT COUNT(*) as missing_policies FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';
-- Expected: 0 (confirming no policies)

SELECT COUNT(*) as empty_fc_blocks FROM fc_blocks WHERE version = 'v1.2';
-- Expected: 0 (confirming empty FC infrastructure)

SELECT COUNT(*) as recent_sessions_no_profiles 
FROM assessment_sessions s 
LEFT JOIN profiles p ON p.session_id = s.id 
WHERE s.completed_at >= NOW() - INTERVAL '7 days' 
AND s.status = 'completed' 
AND p.id IS NULL;
-- Expected: >0 (confirming sessions without profiles)
```

## Deployment Steps

### Step 1: Database Fix (RLS Policy)
```sql
-- Apply RLS policy fix
CREATE POLICY "Service role can manage profiles" 
ON public.profiles 
FOR ALL 
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Verify policy applied
SELECT policyname FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';
-- Expected: 'Service role can manage profiles'
```

### Step 2: Code Updates (Edge Functions)
- Update `score_prism/index.ts` with enhanced FC fallback
- Update `finalizeAssessment/index.ts` with better error logging
- Deploy functions via normal CI/CD process

### Step 3: Immediate Verification Test
```bash
# Test with recent completed session
curl -X POST "${STAGING_URL}/functions/v1/finalizeAssessment" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "618c5ea6-aeda-4084-9156-0aac9643afd3"}'

# Expected response:
# {
#   "ok": true,
#   "status": "success", 
#   "session_id": "618c5ea6-aeda-4084-9156-0aac9643afd3",
#   "share_token": "...",
#   "profile": { "results_version": "v1.2.1", ... },
#   "results_url": "https://staging.../results/618c5ea6...?t=..."
# }
```

### Step 4: Validate Profile Creation
```sql
-- Check if profile was created
SELECT id, session_id, results_version, type_code, created_at 
FROM profiles 
WHERE session_id = '618c5ea6-aeda-4084-9156-0aac9643afd3';
-- Expected: 1 row with v1.2.1
```

## Success Criteria

### Immediate (< 15 minutes)
- [ ] RLS policy created successfully
- [ ] Functions deployed without errors  
- [ ] Test session generates profile with v1.2.1
- [ ] No function errors in logs

### Short-term (< 1 hour)
- [ ] New assessment completions generate profiles
- [ ] Conversion rate returns to >90%
- [ ] fc_fallback_legacy events logged (expected until FC infrastructure)
- [ ] No RLS violation errors

### Medium-term (< 24 hours)
- [ ] All 40+ recent sessions can be backfilled
- [ ] Profile generation stable and consistent
- [ ] Ready for FC infrastructure completion

## Rollback Plan

### If RLS Policy Causes Issues
```sql
DROP POLICY "Service role can manage profiles" ON public.profiles;
```

### If Function Updates Cause Issues  
- Revert to previous function code via git  
- Redeploy previous working versions
- RTO: < 10 minutes

### If Complete Rollback Needed
1. Drop RLS policy
2. Revert function code  
3. Update scoring_config back to v1.2.0 if needed
4. Total RTO: < 15 minutes

## Risk Assessment

| Component | Risk Level | Mitigation |
|-----------|------------|------------|
| RLS Policy | 🟢 LOW | Only enables service role, reversible |
| score_prism Changes | 🟢 LOW | Enhances existing fallback logic |
| finalizeAssessment Logging | 🟢 MINIMAL | Logging only, no logic changes |
| Overall Deployment | 🟢 LOW | Minimal changes, immediate rollback available |

## Post-Fix Next Steps

### IR-08: Backfill Missing Profiles
- Run backfill process for 40+ sessions without profiles
- Restore 20+ days of lost assessment data
- Validate data integrity post-backfill

### FC Infrastructure Completion
- Populate fc_blocks and fc_options tables  
- Enable proper FC scoring for v1.2.1
- Complete transition to new data model

### Monitoring & Alerting
- Set up alerts for profile generation failures
- Monitor FC scoring success rates
- Track conversion metrics ongoing

## Approval Gate

**READY FOR DEPLOYMENT**: ✅  
**Risk Level**: LOW  
**Complexity**: MINIMAL  
**Reversibility**: HIGH  
**Expected Impact**: IMMEDIATE restoration of profile generation

---
**Execute**: Deploy hotfix immediately to restore basic functionality  
**Timeline**: 15 minutes deployment + testing  
**Success Metric**: Test session generates profile with v1.2.1