# RPC Health Check - get_results_by_session

## Test Parameters
- Session ID: `618c5ea6-aeda-4084-9156-0aac9643afd3`
- Share Token: `7e4f523d-9d8d-4b3c-8cb9-a3d8600a4da5`

## RPC Function Test Results

**STATUS: FAILED** ❌

### Error Details:
```
ERROR: 42702: column reference "session_id" is ambiguous
DETAIL: It could refer to either a PL/pgSQL variable or a table column.
QUERY: select exists (
  select 1
  from public.assessment_sessions s
  join public.profiles p on p.session_id = s.id
  where s.id = session_id
    and p.share_token = t
    -- include expiry predicate here if applicable
)
CONTEXT: PL/pgSQL function public.get_results_by_session(uuid,text) line 9 at SQL statement
```

## Root Cause Analysis

The `get_results_by_session` RPC function has a SQL bug:
- Column reference `session_id` is ambiguous in the WHERE clause
- Could refer to either the function parameter or the table column `p.session_id`
- This prevents the function from executing successfully

## Security Verification ✅
- Function is marked as `SECURITY DEFINER` 
- No direct table reads from frontend
- Uses proper RPC pattern

## Recommended Fix
The RPC function needs parameter disambiguation:
```sql
where s.id = get_results_by_session.session_id
  and p.share_token = get_results_by_session.t
```