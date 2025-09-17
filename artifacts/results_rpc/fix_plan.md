# Results RPC Fix Plan

## Problem
Column reference ambiguity in `get_results_by_session` RPC prevents data retrieval.

## Solution Strategy
**Minimal, Safe Fix**: Qualify all parameter references to eliminate ambiguity while preserving existing logic and return format.

## Proposed Changes

### Function Signature (Unchanged)
```sql
public.get_results_by_session(session_id uuid, t text DEFAULT NULL::text)
RETURNS jsonb
```

### Key Fixes Required
1. **Parameter Qualification**: Prefix all parameter references with function name
   - `session_id` → `get_results_by_session.session_id`
   - `t` → `get_results_by_session.t`

2. **Table Aliases**: Maintain existing `s` and `p` aliases for clarity

3. **Logic Preservation**: Keep dual access path (token vs auth.uid())

### Fixed Query Example
```sql
-- FROM (ambiguous)
where s.id = session_id and p.share_token = t

-- TO (qualified) 
where s.id = get_results_by_session.session_id 
  and p.share_token = get_results_by_session.t
```

## Return Format (Preserved)
```json
{
  "profile": {
    "id": "uuid",
    "session_id": "uuid", 
    "type_code": "string",
    "top_types": {},
    "strengths": {},
    "version": "string",
    "overlay": "string",
    "conf_band": "string", 
    "conf_calibrated": number,
    "score_fit_calibrated": number,
    "created_at": "timestamp"
  },
  "session": {
    "id": "uuid",
    "status": "string",
    "session_type": "string", 
    "started_at": "timestamp",
    "completed_at": "timestamp",
    "finalized_at": "timestamp",
    "total_questions": number,
    "completed_questions": number
  }
}
```

## Risk Assessment
- **Functional Impact**: NONE (pure parameter disambiguation)
- **Breaking Changes**: NONE (identical return format)
- **Performance**: NONE (same query logic)
- **Security**: MAINTAINED (same SECURITY DEFINER + validation)

## Files to Modify
1. Create migration: `migrations/results_rpc_apply.sql`
2. Create rollback: `migrations/results_rpc_rollback.sql`

## Verification Plan
1. SQL test with production session/token
2. Browser test: tokenized URL → 200, no-token → 401/403  
3. Network capture: single RPC call
4. Version stamps: confirm v1.2.1 in payload

## Optional Enhancement
Add index for token validation performance:
```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_sessions_id_share_token 
ON public.assessment_sessions (id, share_token);
```