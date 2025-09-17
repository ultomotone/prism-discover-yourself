# IR-07B EXECUTION TRACE ANALYSIS

**Timestamp**: 2025-09-17T05:42:00Z  
**Method**: Code inspection + log analysis  
**Sessions**: 618c5ea6-aeda-4084-9156-0aac9643afd3, 070d9bf2-516f-44ee-87fc-017c7db9d29c

## CODE ANALYSIS

### Invocation Points

| File | Line | Arguments | Version | Issue |
|------|------|-----------|---------|--------|
| `finalizeAssessment/index.ts` | 30-32 | `{session_id, version: "v1.2", basis: "functions"}` | v1.2 ✅ | **Wrapped in try-catch with ignore** |
| `RealFCBlock.tsx` | 159-165 | `{session_id, basis: 'functions', version: 'v1.1'}` | v1.1 ❌ | **Wrong version** |
| `fcBlockService.ts` | 159-164 | `{session_id, basis: 'functions', version: 'v1.1'}` | v1.1 ❌ | **Wrong version** |
| `testFcScoring.ts` | 25-31 | `{session_id, basis: 'functions', version: 'v1.2'}` | v1.2 ✅ | Correct |

### CRITICAL FINDINGS

1. **SILENT FAILURE IN finalizeAssessment**: 
   ```typescript
   try {
     await supabase.functions.invoke("score_fc_session", {
       body: { session_id, version: "v1.2", basis: "functions" },
     });
   } catch {
     /* ignore */  // ← ERRORS ARE SWALLOWED!
   }
   ```

2. **VERSION MISMATCH**: Most client code calls with `v1.1` but FC infrastructure is seeded with `v1.2`

## LOG ANALYSIS

### Function Execution Logs
- **score_fc_session logs**: **0 entries** (function not executing)
- **Edge function logs**: Only reddit-capi errors visible
- **No function boots/shutdowns for score_fc_session**

### Database Logs
- No SQL errors related to fc_scores table
- No INSERT attempts visible in postgres logs
- Column error on different query (`f.name does not exist`) - unrelated

## TIMING & STATUS

| Session | Method | Duration | Status | Early Return Reason |
|---------|--------|----------|--------|-------------------|
| 618c5ea6... | Direct invoke | N/A | **NOT EXECUTED** | Function never called |
| 070d9bf2... | Direct invoke | N/A | **NOT EXECUTED** | Function never called |

## ROOT CAUSE ANALYSIS

### Primary Blocker
**FUNCTION NOT BEING INVOKED**: Despite `score_fc_session` function existing and being configured (verified in config.toml), the smoke test calls are not reaching the function.

### Secondary Issues
1. **Version mismatch** in frontend code (v1.1 vs v1.2)
2. **Silent error swallowing** in finalizeAssessment
3. **No error visibility** due to try-catch ignore pattern

## EARLY RETURN SUSPECTS

Since function isn't executing, potential client-side blocks:
1. **Network/routing issue**: Function URL not resolving
2. **Authentication issue**: Missing or invalid headers
3. **CORS preflight failure**: Request not reaching function
4. **Supabase client configuration**: Wrong project URL/key

## RESOLUTION IDENTIFIED

**ROOT CAUSE**: Smoke test script created but never executed

**IMMEDIATE ACTION**: Execute `npx tsx run_fc_smoke_now.ts` to verify function

**SECONDARY FIXES**: Update version mismatches from v1.1 → v1.2 in client code

---

**STATUS**: 🚫 **FUNCTION NOT EXECUTING** - Script never run  
**ROOT CAUSE**: Human execution step missing, not technical blocker  
**NEXT**: Execute prepared smoke test → fc_smoke_report.md