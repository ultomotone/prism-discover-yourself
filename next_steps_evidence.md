# Evidence Gate - Manual Execution Required

## Current Status: Infrastructure Verified ✅

All prerequisites confirmed:
- Test session 618c5ea6-aeda-4084-9156-0aac9643afd3 has 248 responses
- FC infrastructure v1.2 active (5+ blocks with options)
- Edge functions deployed (finalizeAssessment, score_fc_session, score_prism)  
- No existing scores (clean slate for testing)

## Required Manual Action: Function Call

Since direct function invocation isn't available through the SQL interface, execute this in the browser console or via a test script:

### Browser Console Method
1. Open browser developer tools on the live preview
2. Paste and execute:

```javascript
// Call finalizeAssessment 
const response = await fetch('https://gnkuikentdtnatazeriu.supabase.co/functions/v1/finalizeAssessment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U'
  },
  body: JSON.stringify({ session_id: '618c5ea6-aeda-4084-9156-0aac9643afd3' })
});

const data = await response.json();
console.log('Evidence Gate Result:', data);

// Copy the results_url for testing
console.log('Results URL:', data.results_url);
```

3. Copy the `results_url` from the response
4. Test the tokenized URL (should work) and non-tokenized URL (should be blocked)

## Post-Execution Verification

After the function call, run these queries to verify evidence:

```sql
-- Check fc_scores created with v1.2
SELECT version, jsonb_typeof(scores_json), blocks_answered 
FROM fc_scores 
WHERE session_id = '618c5ea6-aeda-4084-9156-0aac9643afd3';

-- Check profiles created with v1.2.1  
SELECT results_version, type_code, overlay
FROM profiles  
WHERE session_id = '618c5ea6-aeda-4084-9156-0aac9643afd3';
```

## Evidence Gate Success Criteria

✅ **PASS** requires ALL of these:
1. finalizeAssessment returns success JSON with results_url
2. fc_scores row exists with version='v1.2' and scores_json is object  
3. profiles row exists with results_version='v1.2.1'
4. results_url works with token (HTTP 200)
5. results_url blocked without token (HTTP 401/403)

## Next Phase After PASS

Once evidence gate passes:
→ **BF-01-APPLY**: Execute staging backfill for ~39 sessions  
→ **STAGE-SOAK**: 6-hour health monitoring  
→ **PROD-ORCH**: Production promotion with same guard rails

---
**Action Required**: Execute finalizeAssessment function call to capture hard evidence.