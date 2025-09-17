# Evidence Gate - SQL Execution via Supabase

## Step 1: Call finalizeAssessment Function

Run this in the Supabase SQL Editor:

```sql
-- Call finalizeAssessment for the test session
SELECT * FROM supabase.functions.invoke(
  'finalizeAssessment',
  '{"session_id": "618c5ea6-aeda-4084-9156-0aac9643afd3"}'::jsonb
);
```

## Step 2: Verify FC Scores (Expect v1.2)

```sql
-- Check fc_scores table for the session
SELECT 
  version,
  fc_kind,
  blocks_answered,
  scores_json IS NOT NULL as has_scores,
  jsonb_typeof(scores_json) as scores_type,
  created_at
FROM fc_scores 
WHERE session_id = '618c5ea6-aeda-4084-9156-0aac9643afd3'
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected**: `version = 'v1.2'`, `has_scores = true`, `scores_type = 'object'`

## Step 3: Verify Profiles (Expect v1.2.1)

```sql
-- Check profiles table for the session
SELECT 
  results_version,
  type_code,
  overlay,
  share_token IS NOT NULL as has_token,
  created_at,
  updated_at
FROM profiles 
WHERE session_id = '618c5ea6-aeda-4084-9156-0aac9643afd3';
```

**Expected**: `results_version = 'v1.2.1'`, `has_token = true`

## Step 4: Get Results URL for HTTP Testing

```sql
-- Get the session share token and build results URL
SELECT 
  id as session_id,
  share_token,
  CONCAT('https://prismassessment.com/results/', id, '?t=', share_token) as results_url_with_token,
  CONCAT('https://prismassessment.com/results/', id) as results_url_no_token
FROM assessment_sessions 
WHERE id = '618c5ea6-aeda-4084-9156-0aac9643afd3';
```

## Step 5: Manual HTTP Testing

Test these URLs in your browser or curl:

1. **With Token** (expect 200): `https://prismassessment.com/results/618c5ea6-aeda-4084-9156-0aac9643afd3?t=<token>`
2. **Without Token** (expect 401/403): `https://prismassessment.com/results/618c5ea6-aeda-4084-9156-0aac9643afd3`

## PASS Criteria Checklist

- [ ] fc_scores.version = 'v1.2' AND scores_json is object
- [ ] profiles.results_version = 'v1.2.1' 
- [ ] Results URL returns 200 with token
- [ ] Results URL returns 401/403 without token
- [ ] No telemetry errors in Edge Function logs

## Next Steps

If all checks PASS → Proceed to **BF-01-APPLY — Backfill (Staging)**
If any FAIL → Run triage diagnostics (IR-07B-INPUTS-VERIFY, IR-07B-RLS-FC)