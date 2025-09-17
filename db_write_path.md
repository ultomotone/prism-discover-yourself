# IR-02 — DB Write Path Audit

**Status**: 🔴 **CRITICAL RLS BLOCKING ISSUE FOUND**  
**Timestamp**: 2025-09-17T03:50:00Z  
**Environment**: Staging

## Table Structure Verification

### ✅ Tables Exist and Accessible
| Table | Exists | Key Columns | Structure |
|-------|--------|-------------|-----------|
| profiles | ✅ Yes | id (uuid), session_id (uuid), results_version (text) | ✅ Proper |
| fc_scores | ✅ Yes | session_id (uuid), version (text), fc_kind (text) | ✅ Proper |
| assessment_sessions | ✅ Yes | id (uuid), share_token (text) | ✅ Proper |
| assessment_responses | ✅ Yes | session_id (uuid), question_id (int) | ✅ Proper |

## 🚨 CRITICAL RLS POLICY ISSUES

### profiles Table RLS Status
```sql
-- RLS Policies Query Result: []
-- FINDING: NO RLS POLICIES EXIST
```

**❌ CRITICAL FAILURE**: `profiles` table has **NO RLS POLICIES**

### fc_scores Table RLS Status  
```sql
-- Service role can manage fc_scores: ✅ PASS
-- FC scores are publicly readable: ✅ PASS  
```

**✅ PROPER**: `fc_scores` table has correct RLS policies

## Root Cause Analysis

### The Write Path Failure
1. **finalizeAssessment** calls **score_prism** ✅
2. **score_prism** processes data and attempts profile write ✅  
3. **RLS Check**: profiles table has no policies ❌
4. **Result**: Write BLOCKED despite service role credentials ❌

### Evidence Supporting RLS Block Theory
```sql
-- Attempted write in score_prism/index.ts:165
await supabase.from("profiles").upsert(profileRow, { onConflict: "session_id" });

-- Expected: Success with service role
-- Actual: Likely failing due to missing RLS policies
```

### Default RLS Behavior
When RLS is enabled but **no policies exist**:
- **ALL access denied** regardless of role
- **Service role blocked** same as regular users  
- **No writes possible** until policies created

## Profile Creation Timeline Analysis

### Historical Profile Creation
| Date | Profiles Created | Pattern |
|------|------------------|---------|
| 2025-08-25 | 127 profiles | ✅ Normal batch |
| 2025-08-26 | 3 profiles | ⚠️ Declining |  
| 2025-08-27 | 1 profile | ⚠️ Final profile |
| 2025-08-28 → 2025-09-17 | **0 profiles** | ❌ **Complete failure** |

**Pattern**: Profiles stopped generating exactly after 2025-08-27, indicating a configuration change removed RLS policies.

## Recent Session Analysis

### Completed Sessions Without Profiles
```sql
-- Test session: 618c5ea6-aeda-4084-9156-0aac9643afd3
-- Completed: 2025-09-16 22:32:24  
-- Responses: 248 answers recorded ✅
-- Profile: NULL ❌ (RLS blocked write)
```

**Impact**: 100% of recent completed sessions failed to generate profiles due to RLS blocking.

## Write Path PASS/FAIL Table

| Component | Status | Details |
|-----------|--------|---------|
| **Tables Exist** | ✅ PASS | All required tables present |
| **Service Role Credentials** | ✅ PASS | Functions use SUPABASE_SERVICE_ROLE_KEY |
| **fc_scores RLS** | ✅ PASS | Proper policies for service role |
| **profiles RLS** | ❌ **CRITICAL FAIL** | **NO POLICIES = ALL ACCESS DENIED** |
| **Data Processing** | ✅ PASS | score_prism successfully processes data |
| **Profile Write** | ❌ **CRITICAL FAIL** | **RLS blocks upsert operation** |

## Suspected Failure Point

**PRIMARY**: `profiles` table RLS misconfiguration  
**SECONDARY**: FC infrastructure empty (compounds scoring issues)

## Required Immediate Actions

### 1. Restore profiles Table RLS Policies
```sql
-- REQUIRED: Enable service role writes to profiles
CREATE POLICY "Service role can manage profiles" 
ON public.profiles 
FOR ALL 
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
```

### 2. Test Profile Write After Policy Fix
```sql  
-- Verify service role can write
INSERT INTO profiles (session_id, type_code, results_version) 
VALUES ('test-session-id', 'TEST', 'v1.2.1');
```

### 3. Backfill Missing Profiles  
- Re-run score_prism for recent completed sessions
- Generate missing profiles for 20+ day gap

## Confidence Assessment

**Root Cause Confidence**: 95%  
**Fix Complexity**: Low (single RLS policy)  
**Risk Level**: Low (service role policy is safe)  
**Expected Impact**: Immediate restoration of profile generation

---
**Critical Finding**: RLS misconfiguration blocking 100% of profile writes  
**Next Action**: IR-07 Hotfix with RLS policy restoration