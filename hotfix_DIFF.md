# IR-07B FIX PLAN - MINIMAL SMOKE TEST UNBLOCK

**Branch**: hotfix/stage-fc-unblock  
**Target**: Fix score_fc_session smoke test execution  
**Priority**: P0 - Blocking FC pipeline verification

## ROOT CAUSE SUMMARY

Based on investigation findings:

| Component | Status | Finding |
|-----------|--------|----------|
| **Function Execution** | ❌ BLOCKED | Function never invoked - 0 logs/traces |
| **RLS/Grants** | ✅ READY | Service role has ALL permissions on fc_scores |
| **Schema Contract** | ✅ READY | Perfect match - ON CONFLICT target matches PK |  
| **Input Data** | ✅ READY | 6 blocks, 24 options, 6 responses per session |

## PRIMARY BLOCKER

**FUNCTION NOT EXECUTING** - The score_fc_session function exists, is configured, but smoke test calls never reach it.

### Evidence
- ✅ Function code exists: `supabase/functions/score_fc_session/index.ts`
- ✅ Function configured: `supabase/config.toml` has `verify_jwt = false`  
- ❌ **Zero execution logs**: No boots, shutdowns, or function calls in edge logs
- ❌ **No network requests**: Browser shows no function invocations
- ❌ **Test script never executed**: `run_fc_smoke_now.ts` created but not run

## SECONDARY ISSUES

### Version Mismatches (Non-Blocking)
| File | Current Version | Should Be | Impact |
|------|----------------|-----------|---------|
| `RealFCBlock.tsx:163` | 'v1.1' | 'v1.2' | ⚠️ Frontend calls wrong version |
| `fcBlockService.ts:163` | 'v1.1' | 'v1.2' | ⚠️ Service calls wrong version |

### Silent Error Swallowing (Non-Blocking)
```typescript
// finalizeAssessment/index.ts:29-35
try {
  await supabase.functions.invoke("score_fc_session", {...});
} catch {
  /* ignore */  // ← Errors swallowed silently
}
```

## MINIMAL FIX PLAN

### PHASE 1: Execute Smoke Test (Immediate)
1. **Run the prepared smoke test**:
   ```bash
   npx tsx run_fc_smoke_now.ts
   ```
2. **Verify function execution** via logs and fc_scores creation
3. **Document results** in fc_smoke_report.md

### PHASE 2: Fix Version Mismatches (Post-Smoke)
Only if smoke test passes, update client code:

```typescript
// RealFCBlock.tsx:159-165  
const { data, error } = await supabase.functions.invoke('score_fc_session', {
  body: {
    session_id: sessionId,
    basis: 'functions',
-   version: 'v1.1'  
+   version: 'v1.2'
  }
});

// fcBlockService.ts:159-164 (same fix)
```

### PHASE 3: Improve Error Visibility (Optional)
```typescript
// finalizeAssessment/index.ts:29-35
try {
  await supabase.functions.invoke("score_fc_session", {...});
} catch (fcError) {
- /* ignore */
+ console.warn('FC scoring failed (non-critical):', fcError);
}
```

## ROLLBACK PLAN

If smoke test fails:
1. **No code changes made** - nothing to rollback
2. **FC seeding intact** - fc_blocks/fc_options remain  
3. **Can retry** - function execution is idempotent
4. **Investigate logs** for actual failure reason

## SUCCESS CRITERIA

### Smoke Test PASS  
- ✅ score_fc_session executes (logs show evt:fc_scoring_start)
- ✅ fc_scores table gets 2 new rows (version='v1.2')
- ✅ Both sessions get scores with 8 cognitive functions  
- ✅ blocks_answered = 6 for each session

### Post-Fix Verification
- ✅ Frontend calls use version='v1.2'  
- ✅ Error visibility improved
- ✅ Ready for IR-09B2 E2E test

## APPROVAL GATE

**EXECUTE PHASE 1 ONLY** - Just run the smoke test, no code changes until results confirmed.

---

**STATUS**: ⏳ AWAITING SMOKE TEST EXECUTION  
**RISK**: LOW - No infrastructure changes, just test execution  
**ROLLBACK**: NONE NEEDED - Test-only operation