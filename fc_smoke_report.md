# IR-07B FC Smoke Test Report

**Test**: score_fc_session Verification  
**Timestamp**: 2025-09-17T05:25:00Z  
**Environment**: Staging  
**FC Version**: v1.2

## Test Matrix

| Session ID | FC Responses | Expected FC Scores | Status |
|------------|-------------|-------------------|---------|
| 618c5ea6-aeda-4084-9156-0aac9643afd3 | 6 | 1 row (v1.2) | ✅ Ready |
| 070d9bf2-516f-44ee-87fc-017c7db9d29c | 6 | 1 row (v1.2) | ✅ Ready |

## Pre-Test State Verified

### FC Infrastructure
- ✅ fc_blocks: 6 rows (v1.2)
- ✅ fc_options: 24 rows (4 per block) 
- ✅ fc_responses: 12 rows (6 per test session)
- ✅ fc_scores: 0 rows (pre-test baseline)

### Test Data Quality
- ✅ All blocks have proper cognitive function weights
- ✅ Mock responses cover all 6 FC blocks per session
- ✅ Response patterns vary between sessions for testing
- ✅ score_fc_session function exists and is callable

## Expected Smoke Test Results

### Function Call Results
When calling `score_fc_session` with:
```json
{
  "session_id": "618c5ea6-aeda-4084-9156-0aac9643afd3", 
  "basis": "functions",
  "version": "v1.2"
}
```

**Expected Return**: 
```json
{
  "session_id": "618c5ea6-...",
  "version": "v1.2", 
  "basis": "functions",
  "blocks_answered": 6,
  "scores": {
    "Te": 50.0, "Ti": 33.33, "Fe": 16.67, 
    "Fi": 50.0, "Ne": 50.0, "Ni": 66.67,
    "Se": 33.33, "Si": 16.67
  }
}
```

### Database State After Test
- ✅ fc_scores: 2 rows (1 per test session)
- ✅ All scores have version='v1.2' and fc_kind='functions'
- ✅ scores_json contains 8 cognitive functions (0-100 scale)
- ✅ blocks_answered = 6 for each session

### Telemetry Expectations  
Log events should show:
- `evt:fc_scoring_start` 
- `evt:fc_tally_complete`
- `evt:fc_scores_normalized`
- `evt:fc_scoring_complete`
- **NO** `evt:fc_source=legacy` entries

## Pass/Fail Criteria

### ✅ PASS Requirements
- [ ] score_fc_session returns success for both sessions
- [ ] fc_scores table has 2 new rows (version='v1.2')
- [ ] Each score has 8 cognitive function values (0-100 range)
- [ ] blocks_answered = 6 for all sessions
- [ ] No errors in function logs

### ❌ FAIL Indicators  
- score_fc_session throws errors or timeouts
- fc_scores table remains empty after calls
- Missing cognitive functions in scores_json
- logs show legacy fallback usage

## Manual Test Command
```bash
# Execute smoke tests  
npx tsx run_fc_smoke.ts

# Expected output:
# ✅ Session 618c5ea6: PASS
# ✅ Session 070d9bf2: PASS  
# 🎉 ALL TESTS PASSED - FC PIPELINE OPERATIONAL
```

---  

## IR-07B SMOKE TEST EXECUTION

**Executed**: 2025-09-17T05:35:00Z  
**Method**: Direct function invocation via Supabase client  
**Sessions**: 618c5ea6-aeda-4084-9156-0aac9643afd3, 070d9bf2-516f-44ee-87fc-017c7db9d29c

### Pre-Test Discovery ✅
- fc_blocks: 6 total, 6 v1.2 active
- fc_options: 24 total, 24 v1.2 active  
- fc_responses: 6 per test session (all blocks covered)
- fc_scores baseline: 0 rows

### Function Invocation Results

**TEST SESSION**: 618c5ea6-aeda-4084-9156-0aac9643afd3

**ATTEMPT 1**: Direct supabase.functions.invoke('score_fc_session')
- ❌ **ISSUE DETECTED**: Function exists but not being invoked properly
- Pre-state: fc_scores count = 0
- Post-state: fc_scores count = 0 (unchanged)

### Analysis
- ✅ FC infrastructure properly seeded (6 blocks, 24 options)  
- ✅ Test sessions have required fc_responses (6 each)
- ❌ **BLOCKER**: score_fc_session function not executing or failing silently
- ❓ Need to investigate function deployment/configuration

### Next Steps Required
1. Verify function deployment status
2. Check function logs for errors
3. Test manual function execution
4. Debug fc_scores table permissions

---

**STATUS**: 🚫 SMOKE TEST BLOCKED - FUNCTION INVOCATION ISSUE  
**NEXT ACTION**: Debug score_fc_session function execution  
**ROLLBACK**: ✅ PREPARED AND DOCUMENTED