# RPC Ambiguity Analysis

## Error Message
```
ERROR: 42702: column reference "session_id" is ambiguous
DETAIL: It could refer to either a PL/pgSQL variable or a table column.
CONTEXT: PL/pgSQL function public.get_results_by_session(uuid,text) line 9 at SQL statement
```

## Root Cause
The function parameter `session_id` creates ambiguity in WHERE clauses where both the parameter and table columns could match.

### Ambiguous References Found:
1. **Line 9**: `where s.id = session_id` - could be parameter or `p.session_id` column
2. **Multiple locations**: Every `session_id` reference needs function qualification

### Column Conflicts:
- Function parameter: `session_id uuid`  
- Table column: `profiles.session_id uuid`
- PostgreSQL cannot determine which reference is intended

## Impact
- RPC function fails on every invocation
- Results page cannot load data
- Both tokenized and authenticated access blocked

## Resolution Required
Fully qualify all parameter references with function name prefix:
`session_id` → `get_results_by_session.session_id`