# GATE-EVIDENCE — Hard PASS Evidence Capture

## Session Under Test
- Session ID: `618c5ea6-aeda-4084-9156-0aac9643afd3`
- Target FC Version: `v1.2`  
- Target Engine Version: `v1.2.1`

## Test Execution Log

### 1. finalizeAssessment Function Call
```bash
# Invoking finalizeAssessment for test session
ts-node test_finalize_evidence.ts
```

### 2. Database Evidence (Read-Only Verification)

#### FC Scores Table Query
```sql
SELECT version, jsonb_typeof(scores_json) AS scores_type, created_at 
FROM fc_scores 
WHERE session_id = '618c5ea6-aeda-4084-9156-0aac9643afd3' 
ORDER BY created_at DESC LIMIT 1;
```

**Expected Result:** 
- version = 'v1.2'
- scores_type = 'object'

**Actual Result:** 
- Status: PENDING EXECUTION

#### Profiles Table Query
```sql
SELECT results_version, created_at, updated_at 
FROM profiles 
WHERE session_id = '618c5ea6-aeda-4084-9156-0aac9643afd3';
```

**Expected Result:**
- results_version = 'v1.2.1'

**Actual Result:**
- Status: PENDING EXECUTION

### 3. HTTP Access Control Test

#### With Token (Should Return 200)
```bash
# GET results_url from finalizeAssessment response
# Expected: HTTP 200 with profile data
```

#### Without Token (Should Return 401/403)  
```bash
# GET /results/618c5ea6-aeda-4084-9156-0aac9643afd3
# Expected: HTTP 401/403 access denied
```

### 4. Telemetry Verification

Expected log events:
- `evt:fc_source=fc_scores` (confirm FC scores used)
- No `evt:engine_version_override` 
- No errors/timeouts

**Actual Logs:**
- Status: PENDING EXECUTION

## Evidence Status

- [ ] finalizeAssessment JSON response captured
- [ ] fc_scores row exists with version='v1.2'
- [ ] profiles row exists with results_version='v1.2.1'  
- [ ] Results URL returns 200 with token
- [ ] Results URL returns 401/403 without token
- [ ] Clean telemetry logs confirmed

## PASS/FAIL Gate

**Overall Status:** PENDING EXECUTION

This gate must show PASS on all evidence points before proceeding to BF-01-APPLY.