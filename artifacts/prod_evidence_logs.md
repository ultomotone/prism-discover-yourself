# Production Evidence - Telemetry Logs

**Session ID**: 618c5ea6-aeda-4084-9156-0aac9643afd3
**Environment**: Production (gnkuikentdtnatazeriu)
**Timestamp**: 2025-09-17T16:31:00Z

## Current Edge Function Activity

### Recent Function Calls (Last 50)
Recent activity shows:
- Multiple `save_response` function calls (200 status)
- Some `reddit-capi` errors (500 status) - unrelated
- **No recent `finalizeAssessment` calls found**

### Function Call Gap Analysis
- Session finalized at: `2025-09-17 15:52:36.076Z`
- FC scores created at: `2025-09-17 15:52:34.74156Z`
- **Gap**: No edge function logs for finalizeAssessment around finalization time
- **Inference**: Profile creation failed silently during finalization

## Expected Telemetry After Function Re-invocation

### Required Log Patterns:
1. **Function Call**: `finalizeAssessment` invocation with 200 status
2. **FC Source**: `evt:fc_source=fc_scores` - Confirms FC data sourced from fc_scores table
3. **No Override**: Absence of `evt:engine_version_override` - Confirms no version overrides
4. **Profile Creation**: Evidence of successful profile insert

### Current Telemetry Status:
- ❌ No finalizeAssessment calls in recent logs
- ❌ No `evt:fc_source=fc_scores` events
- ❌ No profile creation evidence in logs
- ⚠️ Session marked finalized without proper function execution

## Post-Invocation Evidence Collection

After running `finalizeAssessment`, collect:

1. **Function execution logs** showing:
   ```
   POST | 200 | /functions/v1/finalizeAssessment
   ```

2. **Event telemetry** showing:
   ```
   evt:fc_source=fc_scores
   ```

3. **Profile creation confirmation** via database queries

4. **No legacy fallbacks** (absence of version overrides)

---

## Current Status: **AWAITING FUNCTION INVOCATION**

The RLS policies have been applied successfully. The finalizeAssessment function must now be invoked to:
- Create the missing profile record
- Generate telemetry evidence
- Complete the evidence collection process