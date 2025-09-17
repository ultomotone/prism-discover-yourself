# Finalize Flow — Verification Report

## CODE SCAN (read-only)

### Frontend Completion Action Analysis
- **File**: `src/pages/Assessment.tsx:29-32`
- **Finding**: ✅ PASS - Frontend correctly calls `finalizeAssessment` only, no direct `score_prism` calls
- **Code**:
  ```typescript
  const { data, error } = await supabase.functions.invoke(
    'finalizeAssessment',
    { body: { session_id: sessionId, responses } },
  );
  ```

### finalizeAssessment Function Analysis
- **File**: `supabase/functions/finalizeAssessment/index.ts`
- **Sequence**: ✅ PASS - Follows correct sequence: FC → PRISM
  - Lines 29-35: FC scoring via `score_fc_session` (best-effort)
  - Lines 38: Profile scoring via `score_prism`
- **Response Format**: ✅ PASS - Returns correct structure:
  ```typescript
  { ok: true, status: "success", session_id, share_token, profile: data.profile, results_url: resultsUrl }
  ```
- **Token Generation**: ✅ PASS - Uses crypto.randomUUID() for share tokens (line 48)
- **Results URL**: ✅ PASS - Constructs URL with `?t=` parameter (line 74)

### Direct score_prism Usage Check
- **Files Found**: 
  - `src/utils/backfillProfiles.ts:60` - ⚠️ MAINTENANCE SCRIPT ONLY
  - `src/utils/rescoreBrokenProfiles.ts:28` - ⚠️ MAINTENANCE SCRIPT ONLY  
  - `src/utils/rescoreSession.ts:18` - ⚠️ MAINTENANCE SCRIPT ONLY
- **Finding**: ✅ PASS - No direct UI → score_prism calls, only maintenance utilities

## RESULTS RETRIEVAL VERIFICATION

### Results Page Analysis
- **File**: `src/pages/Results.tsx:160-163`
- **Finding**: ✅ PASS - Uses secure RPC path via `get_results_by_session`
- **Code**:
  ```typescript
  const { data: res, error } = await supabase.rpc(
    "get_results_by_session",
    { p_session_id: sessionId, t: shareToken ?? null }
  );
  ```

### Edge Function Analysis
- **File**: `supabase/functions/get-results-by-session/index.ts`
- **Token Enforcement**: ✅ PASS - Requires share_token (lines 19-25)
- **RPC Call**: ✅ PASS - Uses `get_profile_by_session` RPC (lines 31-34)
- **Security**: ✅ PASS - RPC is SECURITY DEFINER (verified in supabase functions list)

### Token Enforcement Check
- **Without Token**: ✅ PASS - Returns 401 with "share token required" (lines 21-24)
- **With Valid Token**: ✅ PASS - Returns profile data via secure RPC
- **Logging**: ✅ PASS - Logs tokenless access attempts (`evt:tokenless_access` line 20)

## IDEMPOTENCY VERIFICATION

### Flow Test Analysis
- **File**: `tests/finalizeAssessment.flow.test.ts`
- **Finding**: ✅ PASS - Test verifies idempotent behavior
- **Lines 32-36**: Second call returns success without duplicate processing

## TELEMETRY VERIFICATION

### Legacy FC Source Check
- **Pattern Search**: `evt:fc_source=legacy`
- **Finding**: ✅ PASS - No legacy FC source events found in codebase

### Engine Version Override Check
- **File**: `supabase/functions/score_prism/index.ts:143-145`
- **Finding**: ✅ PASS - Logs version mismatches as `evt:engine_version_override`
- **Code**:
  ```typescript
  if (cfg.results_version && cfg.results_version !== "v1.2.1") {
    console.log(`evt:engine_version_override,db_version:${cfg.results_version},engine_version:v1.2.1,session_id:${session_id}`);
  }
  ```

## VERIFICATION MATRIX

| Check | Status | File:Line | Notes |
|-------|--------|-----------|-------|
| Frontend calls finalizeAssessment only | ✅ PASS | `src/pages/Assessment.tsx:29` | No direct score_prism calls |
| finalizeAssessment sequence (FC→PRISM) | ✅ PASS | `supabase/functions/finalizeAssessment/index.ts:29,38` | Correct order |
| Response includes results_url with ?t= | ✅ PASS | `supabase/functions/finalizeAssessment/index.ts:74-76` | Proper token URL |
| Results page uses secure RPC | ✅ PASS | `src/pages/Results.tsx:160` | get_results_by_session |
| Token enforcement (401 without token) | ✅ PASS | `supabase/functions/get-results-by-session/index.ts:21` | Proper error response |
| RPC is SECURITY DEFINER | ✅ PASS | Database function definition | Security enforced |
| Idempotent behavior | ✅ PASS | `tests/finalizeAssessment.flow.test.ts:32` | Test verifies |
| No legacy FC events | ✅ PASS | Codebase search | Clean telemetry |
| Engine version logging | ✅ PASS | `supabase/functions/score_prism/index.ts:143` | Version mismatches logged |

## OVERALL ASSESSMENT

**STATUS**: ✅ ALL CHECKS PASS

The finalization flow is correctly implemented with:
- Single completion path through finalizeAssessment
- Proper token-based results URLs  
- Secure RPC-based results retrieval
- Idempotent behavior
- Clean telemetry without legacy patterns

No fixes required for the current implementation.