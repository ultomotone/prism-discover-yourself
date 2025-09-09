# Production Cutover Runbook

This runbook describes how to disable the legacy results endpoint and cut over to token/owner paths in production.

## Deployment Order
1. **Backend**
   - Ensure database migrations are applied and `get_results_by_session` is deployed.
   - Revoke legacy RPC access only after verifying the new paths.
2. **Frontend**
   - Set `VITE_ALLOW_LEGACY_RESULTS=false` in the environment.
   - Confirm `RESULTS_BASE_URL` points to the canonical domain.
   - Deploy the frontend.

## Verification
### Browser
- **Token path**: Open `/results/<sessionId>?t=<token>` in an incognito window; page renders.
- **Owner path**: While logged in, open `/results/<sessionId>`; page renders.
- **Legacy link**: Open `/results/<legacySessionId>` in incognito; request fails with the expected error.

### Curl
```bash
# Token path
curl -sS -X POST "$SUPA_URL/rest/v1/rpc/get_results_by_session" \
 -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -H "Content-Type: application/json" \
 -d '{"session_id":"'$SESSION_ID'","t":"'$TOKEN'"}' | jq .

# Owner path (replace USER_JWT with a real user token)
curl -sS -X POST "$SUPA_URL/rest/v1/rpc/get_results_by_session" \
 -H "apikey: $ANON" -H "Authorization: Bearer $USER_JWT" -H "Content-Type: application/json" \
 -d '{"session_id":"'$SESSION_ID'"}' | jq .
```

## SQL Checks
Run in Supabase SQL editor:
```sql
-- Confirm RPC privileges
select p.proname, p.prosecdef as security_definer,
       has_function_privilege('anon', p.oid, 'EXECUTE')  as anon_can_exec,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as auth_can_exec
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public'
  and p.proname in ('get_results_by_session','get_results_by_session_legacy');

-- Verify RLS and anon privileges
select n.nspname, c.relname, c.relrowsecurity as rls_on
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('profiles','assessment_sessions');

select
  has_table_privilege('anon','public.profiles','SELECT') as anon_profiles_select,
  has_table_privilege('anon','public.assessment_sessions','SELECT') as anon_sessions_select;
```

### Expected Results
- `get_results_by_session` EXECUTE: `anon=true`, `auth=true`.
- `get_results_by_session_legacy` EXECUTE: `anon=false`, `auth=false`.
- RLS remains enabled on `profiles` and `assessment_sessions`.
- Anon has no direct table `SELECT` privileges.

## Rollback
1. Set `VITE_ALLOW_LEGACY_RESULTS=true` and redeploy the frontend.
2. Re-grant legacy RPC if needed:
```sql
grant execute on function public.get_results_by_session_legacy(uuid) to anon, authenticated;
```
3. Redeploy backend if additional changes were reverted.

