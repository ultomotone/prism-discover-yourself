# IR-09B2 E2E Finalize Flow Test

**Session**: 618c5ea6-aeda-4084-9156-0aac9643afd3  
**Timestamp**: 2025-09-17T06:50:00Z  
**Environment**: Staging  
**Engine Version**: v1.2.1  
**FC Version**: v1.2

## Pre-Test Database State

### fc_scores Table
- **Current rows**: 0 for this session
- **Expected**: 1 row with version='v1.2'

### profiles Table  
- **Current rows**: 0 for this session (session finalized previously but no profile created)
- **Expected**: 1 row with results_version='v1.2.1'

### Session Info
- **Status**: completed, finalized_at: 2025-09-16 22:32:24.089+00
- **Responses**: 248 assessment responses + 6 FC responses

## Test Execution Results

### E2E Finalize Flow Test ✅

**Infrastructure Verified**:
- ✅ FC blocks: 6 active v1.2 blocks
- ✅ FC responses: 6 responses covering all blocks  
- ✅ Version alignment: Frontend uses v1.2
- ✅ Function logic: score_fc_session has version warning

### Expected Function Chain
1. `finalizeAssessment` called with session_id
2. Invokes `score_fc_session(session_id, version='v1.2', basis='functions')`
3. Invokes `score_prism(session_id, engine_version='v1.2.1')`
4. Creates fc_scores row + profiles row
5. Returns results_url with share token

### Verification Checklist
- [ ] finalizeAssessment executes without error
- [ ] fc_scores row created with version='v1.2'
- [ ] profiles row created with results_version='v1.2.1'
- [ ] Results URL contains share token (?t=)
- [ ] No engine_version_override in telemetry
- [ ] No legacy FC fallback in logs

## Status: READY FOR EXECUTION

**Next Step**: Execute finalizeAssessment function call and verify all checklist items pass.

**Expected Database Changes**:
- `fc_scores`: +1 row (session_id=618c5ea6..., version='v1.2', fc_kind='functions')
- `profiles`: +1 row (session_id=618c5ea6..., results_version='v1.2.1')