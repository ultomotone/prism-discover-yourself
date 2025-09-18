# Admin Gateway Documentation

The Admin Gateway (`db_admin`) Edge Function provides secure, audited access to critical database operations without exposing service-role credentials.

## Authentication

All requests require the `X-Admin-Key` header:

```bash
curl -H "X-Admin-Key: $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"<action>","params":{...}}' \
  https://<project>.functions.supabase.co/db_admin
```

## Available Actions

### Toggle RLS (Development Only)

```bash
# Disable RLS for testing
curl -H "X-Admin-Key: $ADMIN_KEY" \
  -d '{"action":"toggle_rls","params":{"table":"public.assessment_sessions","enabled":false}}' \
  https://<project>.functions.supabase.co/db_admin

# Re-enable RLS
curl -H "X-Admin-Key: $ADMIN_KEY" \
  -d '{"action":"toggle_rls","params":{"table":"public.assessment_sessions","enabled":true}}' \
  https://<project>.functions.supabase.co/db_admin
```

### Grant/Revoke Table Permissions

```bash
# Grant SELECT to authenticated users
curl -H "X-Admin-Key: $ADMIN_KEY" \
  -d '{"action":"grant_table","params":{"table":"public.profiles","grantee":"authenticated","privileges":["SELECT"]}}' \
  https://<project>.functions.supabase.co/db_admin

# Revoke permissions
curl -H "X-Admin-Key: $ADMIN_KEY" \
  -d '{"action":"revoke_table","params":{"table":"public.profiles","grantee":"authenticated","privileges":["SELECT"]}}' \
  https://<project>.functions.supabase.co/db_admin
```

### Install RLS Policies

#### Owner-or-Email Policy (Assessment Sessions)

```bash
curl -H "X-Admin-Key: $ADMIN_KEY" \
  -d '{"action":"policy_owner_or_email","params":{"table":"public.assessment_sessions"}}' \
  https://<project>.functions.supabase.co/db_admin
```

This installs a policy allowing users to see sessions where:
- `user_id = auth.uid()` (they own the session), OR  
- `user_id IS NULL AND email matches their JWT email`

#### Service Role Policy (Profiles)

```bash
curl -H "X-Admin-Key: $ADMIN_KEY" \
  -d '{"action":"policy_service_role_profiles"}' \
  https://<project>.functions.supabase.co/db_admin
```

Grants full access to `public.profiles` for service-role operations.

### Configuration Management

```bash
# Set scoring version
curl -H "X-Admin-Key: $ADMIN_KEY" \
  -d '{"action":"config_set","params":{"key":"results_version","value":"v1.2.1"}}' \
  https://<project>.functions.supabase.co/db_admin
```

### Data Operations

#### Seed Test Sessions

```bash
# Create 10 fake assessment sessions
curl -H "X-Admin-Key: $ADMIN_KEY" \
  -d '{"action":"seed_sessions","params":{"rows":10}}' \
  https://<project>.functions.supabase.co/db_admin
```

#### Backfill Missing Profiles

```bash
# Dry run - check how many sessions need profiles
curl -H "X-Admin-Key: $ADMIN_KEY" \
  -d '{"action":"backfill_profiles","params":{"dryRun":true,"sinceDays":30}}' \
  https://<project>.functions.supabase.co/db_admin

# Actually run the backfill
curl -H "X-Admin-Key: $ADMIN_KEY" \
  -d '{"action":"backfill_profiles","params":{"dryRun":false,"sinceDays":30}}' \
  https://<project>.functions.supabase.co/db_admin
```

#### Recompute Single Session

```bash
curl -H "X-Admin-Key: $ADMIN_KEY" \
  -d '{"action":"recompute_session","params":{"sessionId":"123e4567-e89b-12d3-a456-426614174000"}}' \
  https://<project>.functions.supabase.co/db_admin
```

### Enable Realtime

```bash
curl -H "X-Admin-Key: $ADMIN_KEY" \
  -d '{"action":"enable_realtime","params":{"table":"public.scoring_results"}}' \
  https://<project>.functions.supabase.co/db_admin
```

## Security Features

- **Allow-listed tables only**: `assessment_sessions`, `profiles`, `scoring_results`, `assessment_responses`, `fc_scores`
- **No arbitrary SQL**: Each action uses parameterized queries or typed Supabase calls
- **Full audit logging**: Every request is logged to `public.change_requests`
- **Authentication required**: `X-Admin-Key` header must match server-side secret

## Response Format

Success:
```json
{
  "ok": true,
  "action": "toggle_rls",
  "details": {
    "table": "public.assessment_sessions",
    "rls_enabled": false
  }
}
```

Error:
```json
{
  "ok": false,
  "code": "UNAUTHORIZED",
  "message": "Invalid admin key"
}
```

## Audit Trail

All operations are logged in `public.change_requests`:

```sql
SELECT action, params, status, result, created_at, created_by 
FROM public.change_requests 
ORDER BY created_at DESC 
LIMIT 10;
```