# Staging Prechecks — Expected Results & Pass/Fail Criteria

## Overview
This document defines the expected outcomes for each check in `prechecks.sql` to determine if staging is ready for v1.2.1 promotion.

## Check Categories

### A. Scoring Config Validation

#### A.1 - Current results_version
- **PASS**: `value = '"v1.2.1"'` and status shows "PASS - Already aligned"
- **ACCEPTABLE**: `value != '"v1.2.1"'` and status shows "FAIL - Needs update to v1.2.1" (expected for initial promotion)
- **FAIL**: Missing key or unexpected value format

#### A.2 - results_version exists  
- **PASS**: Key exists in scoring_config table
- **FAIL**: Key missing from configuration

**Decision Criteria**: A.1 can show "needs update" (acceptable), but A.2 must PASS.

---

### B. RPC Function Validation

#### B.1 - RPC function exists
- **PASS**: 
  - `function_name = 'get_profile_by_session'`
  - `security_type = 'SECURITY DEFINER'`
  - Arguments include both `p_session_id` and `p_share_token`
  - Status shows "PASS"
- **FAIL**: Missing function, wrong security type, or missing required arguments

#### B.2 - RPC function missing check
- **PASS**: This query returns no rows (function exists)
- **FAIL**: Query returns row indicating function is missing

**Decision Criteria**: Both B.1 and B.2 must PASS for secure results access.

---

### C. Row Level Security (RLS) Validation

#### C.1 - Profiles RLS enabled
- **PASS**: `rls_enabled = 'true'` and status "PASS - RLS enabled"
- **FAIL**: `rls_enabled = 'false'` (allows unrestricted public access)

#### C.2 - Profiles RLS policies
- **PASS**: `policy_count > 0` and status "PASS - Has RLS policies"
- **FAIL**: `policy_count = 0` (no access controls)

#### C.3 - Profiles no policies check
- **PASS**: This query returns no rows (policies exist)
- **FAIL**: Query returns row indicating no policies found

**Decision Criteria**: All C.x checks must PASS. Profiles table without RLS is a security risk.

---

### D. Share Token Infrastructure

#### D.1 - share_token column
- **PASS**: Column exists, `is_nullable = 'NO'`, has `column_default`
- **WARN**: Column exists but is nullable (acceptable but suboptimal)
- **FAIL**: Column missing or no default value

#### D.2 - share_token missing check
- **PASS**: This query returns no rows (column exists)
- **FAIL**: Query returns row indicating column missing

#### D.3 - share_token NULL count
- **PASS**: `null_count = '0'` (no NULL tokens)
- **WARN**: `null_count <= 5` (few NULL tokens, acceptable)
- **FAIL**: `null_count > 5` (indicates systemic issue)

**Decision Criteria**: D.1 and D.2 must PASS. D.3 WARN is acceptable for existing data.

---

### E. Forced Choice Scoring Coverage

#### E.1 - FC scores version distribution
- **PASS**: Majority of rows show `version = 'v1.2'` with status "PASS - Target version"
- **WARN**: Some `version LIKE 'v1.%'` legacy versions (acceptable during transition)
- **FAIL**: Unknown versions or no v1.2 coverage

#### E.2 - Sessions missing FC scores
- **PASS**: `sessions_without_fc = '0'` (all completed sessions have FC scores)
- **WARN**: `sessions_without_fc <= 10` (few missing, acceptable)
- **FAIL**: `sessions_without_fc > 10` (systematic FC scoring failure)

**Decision Criteria**: E.1 should show v1.2 dominance. E.2 WARN acceptable if count is low.

---

### F. Legacy Artifact Detection

#### F.1 - Legacy FC map usage (scoring_key)
- **PASS**: `questions_with_fc_map = '0'` (no legacy FC maps)
- **WARN**: `questions_with_fc_map > 0` (legacy maps present, acceptable if transitioning)

#### F.2 - Assessment questions FC map
- **PASS**: `questions_with_fc_map = '0'` (no legacy FC maps)
- **WARN**: `questions_with_fc_map > 0` (legacy maps in questions)

**Decision Criteria**: WARN acceptable for both F.1 and F.2 during transition. These are informational.

---

### SUMMARY - Overall Readiness Assessment

#### SUMMARY - Staging Readiness
- **READY**: Status shows "READY - Core components aligned"
  - results_version configured (may need update)
  - get_profile_by_session RPC exists with proper security
- **NOT READY**: Status shows "NOT READY - Check failures above"
  - Critical security or functional components missing

## Pass/Fail Decision Matrix

### MUST PASS (Deployment Blockers)
- **A.2**: results_version key exists
- **B.1 & B.2**: Secure RPC function present  
- **C.1, C.2, C.3**: RLS properly configured
- **D.1 & D.2**: share_token infrastructure present

### ACCEPTABLE WARNINGS (Non-Blocking)
- **A.1**: results_version needs update (expected for promotion)
- **D.3**: Few NULL share_tokens in existing data
- **E.1 & E.2**: Some legacy FC versions or missing scores
- **F.1 & F.2**: Legacy FC artifacts during transition

### DEPLOYMENT DECISION
- **PROCEED**: All MUST PASS checks pass, warnings acceptable
- **HALT**: Any MUST PASS check fails
- **INVESTIGATE**: Unexpected results or high warning counts

## Post-Check Actions

### If PROCEED
1. Document current state in `stage_baseline.md`
2. Apply version alignment changes
3. Run post-deployment verification

### If HALT
1. Address failing checks
2. Re-run prechecks.sql
3. Document remediation in `staging_fixes.md`

## Verification Commands

```sql
-- Quick readiness check
SELECT COUNT(*) as critical_failures 
FROM (
  -- Add critical check conditions here
  SELECT 1 WHERE NOT EXISTS(SELECT 1 FROM scoring_config WHERE key = 'results_version')
  UNION ALL
  SELECT 1 WHERE NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
                            WHERE n.nspname = 'public' AND p.proname = 'get_profile_by_session')
) t;
-- Result should be 0 for PROCEED
```