# Auto-Finalize 248-Question Sessions Setup

## Overview
This system automatically finalizes sessions with 248+ completed questions and provides dashboard results links to authenticated users. It's idempotent and safe for scheduled execution.

## Components Deployed

### 1. Database Migration ✅
- Added `profiles.responses_hash` column for tracking response changes
- Ensured `assessment_sessions.share_token` exists for all sessions
- Created helper functions:
  - `compute_session_responses_hash(uuid)` - Creates stable hash of session responses
  - `get_results_url(uuid)` - Builds results URL with share token
  - `get_dashboard_results_by_email(text)` - RPC for dashboard results (auth required)

### 2. Edge Function ✅
- **Function**: `cron-force-finalize-248`
- **Purpose**: Auto-finalize 248+ question sessions with email addresses
- **Logic**: 
  - Only recomputes if responses_hash changed or profile missing
  - Calls `finalizeAssessment` edge function for scoring
  - Updates `responses_hash` after finalization
  - Ensures share tokens exist for all sessions

### 3. Frontend Integration ✅
- **Component**: Updated `UserDashboard.tsx`
- **Features**:
  - Shows completed PRISM results with direct links
  - Uses new `get_dashboard_results_by_email` RPC
  - Displays confidence, fit scores, and type codes
  - Secure: Only shows results for authenticated user's email

## Deployment Steps

### Set Environment Variables
In Supabase Edge Functions settings, add:
```
PUBLIC_SITE_URL=https://prispersonality.com
```

### Schedule the Edge Function
In Supabase Dashboard → Edge Functions, set up cron job:
- **Function**: `cron-force-finalize-248`
- **Schedule**: `*/15 * * * *` (every 15 minutes)
- **Description**: Auto-finalize 248+ question sessions

### Manual Execution (Testing)
You can test the function manually by calling:
```
POST https://gnkuikentdtnatazeriu.functions.supabase.co/cron-force-finalize-248
```

Expected response:
```json
{
  "ok": true,
  "count": 5,
  "results": [
    {
      "session_id": "uuid",
      "recomputed": true,
      "results_url": "https://prispersonality.com/results/uuid?t=token"
    }
  ],
  "processed_at": "2025-09-17T22:45:00.000Z"
}
```

## Behavior & Guarantees

### Auto-Finalization
- **Triggers**: Sessions with `completed_questions >= 248` and non-empty `email`
- **Idempotent**: Only recomputes when `responses_hash` changes
- **Safe**: Uses existing `finalizeAssessment` function for consistency
- **Rate-Limited**: Processes max 500 sessions per execution

### Dashboard Results
- **Security**: Only shows results for authenticated user's email (RLS enforced)
- **Data**: Shows type_code, confidence, fit scores, and direct results URLs
- **URLs**: Use share tokens for secure, direct access to results pages

### Hash-Based Updates
- **Detection**: MD5 hash of ordered question responses (latest per question)
- **Efficiency**: Skips recomputation if responses unchanged
- **Consistency**: Ensures profile matches current response state

## Verification

### Test the System
1. **Database**: Call RPC manually
   ```sql
   SELECT * FROM get_dashboard_results_by_email('user@example.com');
   ```

2. **Edge Function**: Manual HTTP call to verify processing
   ```bash
   curl -X POST https://gnkuikentdtnatazeriu.functions.supabase.co/cron-force-finalize-248
   ```

3. **Frontend**: Login as user with completed sessions, check dashboard

### Expected Outcomes
- Completed 248+ question sessions appear in dashboard with "View Results" links
- Results URLs work directly (with share token authentication)
- Cron function processes sessions without errors
- Only changed sessions trigger recomputation

## Monitoring

### Function Logs
Check Supabase Edge Function logs for:
- Processing counts and timing
- Error messages for failed sessions
- Hash comparison results

### Database Queries
Monitor for:
- Sessions with missing `share_token` (should be auto-filled)
- Profiles with missing `responses_hash` (updated after finalization)
- RPC performance for dashboard queries

## Security Notes

- Dashboard RPC requires authentication and email ownership verification
- Share tokens provide secure, direct access to results without login
- Results URLs are time-limited by session expiry settings
- No direct database access from frontend - all data via secure RPCs

## Performance Considerations

- Edge function limited to 500 sessions per execution (15-minute intervals)
- Hash computation is lightweight (MD5 of response string)
- Dashboard queries use indexed session_id and email lookups
- Results URLs cached until share token rotation