# IR-09B2 E2E Finalize Flow Test

**Session**: 618c5ea6-aeda-4084-9156-0aac9643afd3  
**Timestamp**: 2025-09-17T07:15:00Z  
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
- **FC Data Quality**: Real weights confirmed for all 8 cognitive functions ✅

## Expected Function Chain
1. `finalizeAssessment` called with session_id
2. Invokes `score_fc_session(session_id, version='v1.2', basis='functions')`
3. Invokes `score_prism(session_id, engine_version='v1.2.1')`
4. Creates fc_scores row + profiles row
5. Returns results_url with share token

## Verification Checklist (E2E Test)
- [ ] finalizeAssessment executes without error
- [ ] fc_scores row created with version='v1.2'
- [ ] profiles row created with results_version='v1.2.1'
- [ ] Results URL contains share token (?t=)
- [ ] GET with token returns 200, GET without token returns 401/403
- [ ] No engine_version_override in telemetry
- [ ] No legacy FC fallback in logs

## Expected Scoring Results

### FC Scores (from actual response data)
Based on session 618c5ea6's FC responses, expected tallied weights:
- **Te**: 9, **Ti**: 9, **Fe**: 5, **Fi**: 6
- **Ne**: 8, **Ni**: 10, **Se**: 7, **Si**: 5

Normalized to 0-100 scale (functions basis):
```json
{
  "Te": 90.0, "Ti": 90.0, "Ne": 80.0, "Ni": 100.0,
  "Se": 70.0, "Fi": 60.0, "Fe": 50.0, "Si": 50.0
}
```

### Expected Database Changes
- **fc_scores**: +1 row (session_id=618c5ea6..., version='v1.2', fc_kind='functions', blocks_answered=6)
- **profiles**: +1 row (session_id=618c5ea6..., results_version='v1.2.1', type_code=calculated)

## E2E Test Execution

**Status**: READY FOR EXECUTION

The test should invoke finalizeAssessment and verify the complete scoring pipeline creates both fc_scores and profiles rows with correct version stamps.