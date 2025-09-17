# IR-07B RLS/GRANTS AUDIT

**Timestamp**: 2025-09-17T05:45:00Z  
**Target**: fc_scores table RLS and permissions  
**Environment**: Staging

## RLS STATUS ✅

| Table | RLS Enabled | Status |
|-------|-------------|---------|
| public.fc_scores | ✅ true | ACTIVE |

## POLICIES ANALYSIS ✅

| Policy Name | Command | Roles | Using Expression | With Check | Status |
|-------------|---------|-------|------------------|------------|---------|
| `Service role can manage fc_scores` | ALL | public | `auth.role() = 'service_role'` | `auth.role() = 'service_role'` | ✅ CORRECT |
| `FC scores are publicly readable` | SELECT | public | `true` | N/A | ✅ CORRECT |

## GRANTS VERIFICATION ✅

- **No explicit table grants found** (normal for Supabase - uses RLS)
- Service role access controlled via RLS policies
- Function uses `SUPABASE_SERVICE_ROLE_KEY` which maps to service_role

## SERVICE ROLE WRITE SIMULATION

### Expected Insert Statement
```sql
INSERT INTO fc_scores (session_id, version, fc_kind, scores_json, blocks_answered)
VALUES ('618c5ea6-aeda-4084-9156-0aac9643afd3', 'v1.2', 'functions', '{"Te": 50.0, "Ti": 33.33, ...}', 6)
ON CONFLICT (session_id, version, fc_kind) 
DO UPDATE SET scores_json = EXCLUDED.scores_json, blocks_answered = EXCLUDED.blocks_answered
```

### RLS Policy Check
- ✅ **INSERT allowed**: `auth.role() = 'service_role'` returns true for service role
- ✅ **UPDATE allowed**: Same policy covers UPDATE operations
- ✅ **SELECT allowed**: Public readable policy allows verification

## COMPATIBILITY TEST ✅

Function execution context:
- Uses `SUPABASE_SERVICE_ROLE_KEY` ✅
- Creates supabase client with service role ✅  
- RLS policies explicitly allow service_role ALL operations ✅

## VERDICT

**PASS** - RLS and grants are correctly configured. fc_scores table is writable by score_fc_session function.

The function should be able to:
1. ✅ INSERT new fc_scores rows
2. ✅ UPDATE existing rows via ON CONFLICT  
3. ✅ SELECT for verification

**RLS IS NOT THE BLOCKER** - Issue lies elsewhere in the execution chain.

---

**STATUS**: ✅ RLS/GRANTS CLEAR  
**NEXT**: Check schema contract and function upsert target compatibility