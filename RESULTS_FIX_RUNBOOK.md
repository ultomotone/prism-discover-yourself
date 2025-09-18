# PRISM Results & Admin Dashboard Fix - Runbook

## Overview
This runbook documents the comprehensive fix for the PRISM assessment platform addressing:
- Results page 404/403 errors
- Admin dashboard showing all zeros  
- Scoring pipeline issues
- Multiple GoTrueClient warnings
- Reddit 404/500 console noise

## What Was Fixed

### 1. Database & RLS Policies
- **Profiles RLS**: Enabled with service-role policy for Edge Functions
- **Sessions RLS**: Clean owner-read policy for authenticated users
- **Config Version**: Updated to v1.2.1 to match scoring engine
- **Admin RPC**: New `admin_get_summary()` function for efficient dashboard data

### 2. Supabase Client Singleton
- **New Client**: `src/lib/supabaseClient.ts` prevents multiple GoTrueClient instances
- **Tracking Client**: Separate client for analytics to avoid auth conflicts
- **Global Usage**: All components now use the singleton client

### 3. Results Page Data Path
- **Edge Function Only**: Results page exclusively calls `get-results-by-session`
- **No Direct REST**: Removed all direct `/rest/v1/` calls from client
- **Token Validation**: Strict token checking maintained

### 4. Edge Functions Hardening
- **Logging**: Structured JSON logs for all scoring events
- **Error Handling**: Proper error propagation with event tracking
- **Backfill Function**: New `admin-backfill-profiles` for historical data

### 5. Console Noise Elimination
- **Router Flags**: Added React Router v7 future flags
- **Reddit Safe Tracking**: Graceful handling of missing Reddit config
- **Structured Logging**: Replaced console spam with structured events

## Key Components Modified

### Database Functions
- `admin_get_summary(last_n_days)` - Efficient dashboard metrics
- `get_profile_by_session(uuid, text)` - Secure results access
- Updated RLS policies on `profiles` and `assessment_sessions`

### Edge Functions
- `admin-backfill-profiles` - Historical data backfill with batching
- `finalizeAssessment` - Enhanced logging and error handling
- `score_prism` - FC fallback logging and better error tracking
- `get-results-by-session` - Maintained strict token validation

### Frontend Components  
- `src/lib/supabaseClient.ts` - Singleton client
- `src/pages/Results.tsx` - Edge Function only data path
- `src/hooks/useAdvancedAdminAnalytics.ts` - Uses new admin summary
- `src/components/admin/AdminControls.tsx` - Backfill integration

## Verification Steps

### 1. New Assessment Flow
```bash
# Complete an assessment and verify:
curl -X POST "https://gnkuikentdtnatazeriu.supabase.co/functions/v1/finalizeAssessment" \
  -H "apikey: [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test-session-id", "responses": []}'

# Should return: profile with results_version='v1.2.1', share_token
```

### 2. Results Page Access
```bash
# Test results access with token
curl "https://gnkuikentdtnatazeriu.supabase.co/functions/v1/get-results-by-session" \
  -H "apikey: [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "session-id", "share_token": "token"}'

# Should return: { status: "success", profile: {...}, session: {...} }
```

### 3. Admin Dashboard
- Navigate to `/admin`
- Verify non-zero metrics for last 30 days
- Test "Backfill Missing Profiles" button

### 4. Database Checks
```sql
-- Verify RLS policies
SELECT polname, cmd, qual, with_check
FROM pg_policies
WHERE tablename='profiles';

-- Verify config version
SELECT value FROM scoring_config WHERE key='results_version';
-- Should return: "v1.2.1"

-- Check profile coverage
SELECT 
  COUNT(*) as total_completed,
  COUNT(p.id) as has_profile,
  ROUND(COUNT(p.id)::float / COUNT(*) * 100, 1) as coverage_pct
FROM assessment_sessions s
LEFT JOIN profiles p ON p.session_id = s.id
WHERE s.status = 'completed' 
AND s.completed_questions >= 248
AND s.created_at >= now() - interval '30 days';
```

### 5. Logging Verification
Check Edge Function logs for structured events:
- `evt:scoring_start` → `evt:scoring_complete` 
- `evt:fc_fallback_legacy` for empty FC tables
- `evt:admin_backfill_*` events during backfill

## Troubleshooting

### Results Page Still 404/403
1. Check session has profile: `SELECT * FROM profiles WHERE session_id = 'xxx'`
2. Verify share token: `SELECT share_token FROM assessment_sessions WHERE id = 'xxx'`  
3. Check RLS policies: `\dp profiles` in psql

### Admin Dashboard Still Zeros
1. Test admin summary: `SELECT admin_get_summary(30)`
2. Check if profiles exist: `SELECT COUNT(*) FROM profiles WHERE created_at >= now() - interval '30 days'`
3. Run backfill: Use "Backfill Missing Profiles" button in admin

### Edge Function Errors
1. Check service role key is set in function secrets
2. Verify function permissions: `GRANT EXECUTE ON FUNCTION ... TO anon, authenticated`
3. Monitor function logs for structured error events

## Rollback Procedure (If Needed)

### Database Rollback
```sql
BEGIN;

-- Remove service-role policy (keep RLS enabled)
DROP POLICY IF EXISTS "profiles_service_role" ON public.profiles;

-- Revert config version if needed
UPDATE scoring_config SET value = '"v1.1.2"'::jsonb WHERE key = 'results_version';

COMMIT;
```

### Code Rollback
1. Revert to `@/integrations/supabase/client` imports
2. Remove singleton client `src/lib/supabaseClient.ts`
3. Restore direct REST calls in Results page if needed

## Security Considerations
- RLS remains enabled on all tables
- Service-role policy only allows Edge Function writes
- Token validation remains strict in results access  
- No client-side access broadening
- Admin functions require proper authentication

## Performance Impact
- Single Supabase client reduces auth overhead
- Admin summary RPC reduces database round trips
- Batched backfill prevents overwhelming the system
- Structured logging improves observability

## Maintenance
- Monitor Edge Function logs for error patterns
- Run backfill monthly for any missed sessions
- Update scoring version when engine updates
- Review RLS policies during security audits