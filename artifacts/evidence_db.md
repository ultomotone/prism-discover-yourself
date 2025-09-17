# Evidence Gate - Database Proof

## Session: 618c5ea6-aeda-4084-9156-0aac9643afd3

### FC Scores Verification
```sql
SELECT version, scores_json, created_at, fc_kind, blocks_answered 
FROM fc_scores 
WHERE session_id = '618c5ea6-aeda-4084-9156-0aac9643afd3' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected**: version = 'v1.2', scores_json is valid JSON object
**Status**: PENDING EXECUTION

### Profiles Verification
```sql
SELECT results_version, created_at, updated_at, type_code, overlay 
FROM profiles 
WHERE session_id = '618c5ea6-aeda-4084-9156-0aac9643afd3';
```

**Expected**: results_version = 'v1.2.1'
**Status**: PENDING EXECUTION

### HTTP Access Verification

**With Token**: GET {results_url} → Expected: 200
**Without Token**: GET /results/{session_id} → Expected: 401/403

**Status**: PENDING EXECUTION

### Telemetry Verification

**Expected Logs**:
- evt:fc_source=fc_scores (present)
- No evt:engine_version_override
- No legacy FC fallback

**Status**: PENDING EXECUTION