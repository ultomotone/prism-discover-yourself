# Results Page Restoration Runbook

## Overview
This runbook covers the end-to-end fix for the PRISM Results page (/results/:sessionId) that addresses RLS policies, logging, config alignment, and profile backfilling.

## What Was Fixed

### 1. RLS Policy on `public.profiles`
- **Problem**: RLS enabled but no service-role policy → Edge Functions couldn't write profiles
- **Solution**: Added `svc_manage_profiles` policy allowing service role full access
- **SQL**: See migration for policy creation

### 2. Config Alignment
- **Problem**: `scoring_config.results_version` was "v1.1.2" but engine expects "v1.2.1"
- **Solution**: Updated config to match engine version
- **Verification**: `SELECT value FROM scoring_config WHERE key = 'results_version'`

### 3. Enhanced Logging
- **Problem**: Silent failures in scoring functions
- **Solution**: Added structured JSON logging to `finalizeAssessment` and `score_prism`
- **Events**: `scoring_start`, `fc_no_responses`, `scoring_complete`, `scoring_error`, `prism_start`, `prism_complete`, `fc_fallback_legacy`

### 4. Backfill Function
- **Problem**: Completed sessions missing profiles
- **Solution**: Created `backfill-profiles` Edge Function
- **Features**: Dry-run mode, progress logging, idempotent operation

## Verification Steps

### 1. New Assessment Flow
```bash
# Complete a new assessment and verify profile creation
curl -X POST "https://gnkuikentdtnatazeriu.supabase.co/functions/v1/finalizeAssessment" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "YOUR_SESSION_ID"}'

# Check profile was created
# Look for logs: evt:scoring_start → evt:scoring_complete
```

### 2. Results Page Access
```bash
# Test results access with valid token
curl "https://gnkuikentdtnatazeriu.supabase.co/functions/v1/get-results-by-session" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "SESSION_ID", "share_token": "SHARE_TOKEN"}'

# Should return 200 with profile JSON
# Invalid/missing token should return 401/403
```

### 3. Backfill Operation
```bash
# Dry run to see what needs backfilling
curl -X POST "https://gnkuikentdtnatazeriu.supabase.co/functions/v1/backfill-profiles" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true, "sinceDays": 30}'

# Actual backfill (run after reviewing dry run results)
curl -X POST "https://gnkuikentdtnatazeriu.supabase.co/functions/v1/backfill-profiles" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false, "sinceDays": 30}'
```

### 4. Database Verification
```sql
-- Check RLS policies are active
SELECT polname, cmd, qual, with_check
FROM pg_policies
WHERE tablename='profiles' AND polname='svc_manage_profiles';

-- Verify config alignment
SELECT key, value FROM scoring_config WHERE key='results_version';

-- Check profile coverage for completed sessions
SELECT 
  COUNT(*) as total_completed,
  COUNT(profile_id) as with_profile_id,
  COUNT(*) - COUNT(profile_id) as missing_profile
FROM assessment_sessions 
WHERE status = 'completed' 
  AND completed_questions >= 248
  AND created_at >= NOW() - INTERVAL '30 days';
```

### 5. Application Flow Test
1. Complete an assessment through the UI
2. Navigate to `/results/:sessionId?t=shareToken`
3. Verify profile loads correctly
4. Check Edge Function logs for structured events

## Monitoring & Logs

### Key Log Events
- `evt:scoring_start` - Assessment finalization begins
- `evt:fc_no_responses` - FC scoring skipped (expected if FC tables empty)
- `evt:fc_fallback_legacy` - Using legacy scoring path
- `evt:scoring_complete` - Profile successfully created
- `evt:scoring_error` - Error during scoring (investigate immediately)
- `evt:backfill_start` - Backfill operation begins
- `evt:backfill_complete` - Backfill operation finished

### Log Locations
- Edge Function logs: Supabase Dashboard → Functions → [Function Name] → Logs
- Structured logs are JSON format for easy parsing

## Troubleshooting

### Results Page 404/403
1. Check if profile exists: `SELECT * FROM profiles WHERE session_id = 'SESSION_ID'`
2. Verify share token: `SELECT share_token FROM assessment_sessions WHERE id = 'SESSION_ID'`
3. Check Edge Function logs for scoring errors

### Missing Profiles for New Assessments
1. Check `finalizeAssessment` logs for `evt:scoring_error`
2. Verify RLS policy: `SELECT * FROM pg_policies WHERE tablename='profiles'`
3. Test service role access manually

### Backfill Issues
1. Run with `dryRun: true` first to identify issues
2. Check logs for `evt:backfill_session_error` events
3. Verify sessions have sufficient response data (248+ questions)

## Rollback Procedure

If issues arise, rollback the RLS policy:
```sql
BEGIN;
DROP POLICY IF EXISTS "svc_manage_profiles" ON public.profiles;
-- Note: This will prevent new profiles from being created
-- You may need to temporarily disable RLS or add different policies
COMMIT;
```

⚠️ **Warning**: Rolling back will prevent new profile creation. Only rollback if critical issues occur.

## Security Notes

- Service role policies only affect server-side Edge Functions
- Client access still goes through SECURITY DEFINER RPC functions
- Token validation remains strict (no weakening of access controls)
- RLS remains enabled on all tables

## Success Criteria

✅ New assessments create profiles immediately  
✅ Results pages load with valid tokens  
✅ Invalid/missing tokens return 401/403  
✅ Backfill processes historical sessions  
✅ Structured logging shows start/complete events  
✅ Config version aligned with engine (v1.2.1)  
✅ No silent failures in scoring process  

## Support

For issues:
1. Check Edge Function logs first
2. Verify database state with SQL queries above
3. Test with curl commands to isolate client vs server issues
4. Review structured log events for error patterns