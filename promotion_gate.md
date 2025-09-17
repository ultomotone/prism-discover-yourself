# IR-09A: End-to-End Verification - Post RLS Fix

**Purpose**: Prove the scoring pipeline is operational after RLS remediation  
**Status**: ⏳ **READY FOR TESTING**  
**Target Session**: `618c5ea6-aeda-4084-9156-0aac9643afd3`

## Test Checklist

### 1. Profile Creation Test ⏳
```bash
# Test the session that was failing before
curl -X POST "https://gnkuikentdtnatazeriu.supabase.co/functions/v1/finalizeAssessment" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "618c5ea6-aeda-4084-9156-0aac9643afd3"}'
```

**Expected Response:**
```json
{
  "ok": true,
  "status": "success",
  "session_id": "618c5ea6-aeda-4084-9156-0aac9643afd3",
  "share_token": "...",
  "profile": {
    "results_version": "v1.2.1",
    "type_code": "...",
    ...
  },
  "results_url": "https://staging.../results/618c5ea6...?t=..."
}
```

### 2. Database Verification ⏳
```sql
-- Confirm profile was created with correct version
SELECT 
  id, 
  session_id, 
  type_code, 
  results_version, 
  created_at,
  confidence
FROM profiles 
WHERE session_id = '618c5ea6-aeda-4084-9156-0aac9643afd3';

-- Expected: 1 row with results_version = 'v1.2.1'
```

### 3. FC Scores Check ⏳
```sql
-- Check if FC scores were generated
SELECT 
  session_id,
  version,
  fc_kind,
  blocks_answered,
  scores_json
FROM fc_scores 
WHERE session_id = '618c5ea6-aeda-4084-9156-0aac9643afd3';

-- Expected: May be empty due to FC infrastructure issues (separate fix needed)
```

### 4. Results Access Enforcement ⏳
```bash
# Test with valid share token
curl "https://staging.../results/618c5ea6-aeda-4084-9156-0aac9643afd3?t=${SHARE_TOKEN}"
# Expected: 200 OK

# Test without token (should be blocked)
curl "https://staging.../results/618c5ea6-aeda-4084-9156-0aac9643afd3"
# Expected: 401/403 Unauthorized
```

### 5. Telemetry Check ⏳
```sql
-- Look for engine version override events (should be 0)
-- Check function logs for:
-- - evt:engine_version_override (expect: 0)
-- - evt:fc_source=legacy vs fc_scores (expect: fc_scores or no FC)
-- - Any scoring function errors (expect: minimal/resolved)
```

## Pass/Fail Criteria

| Test | Status | Criteria | Notes |
|------|--------|----------|-------|
| Profile Creation | ⏳ | SUCCESS response + profile row created | Critical - was failing before |
| Version Stamping | ⏳ | results_version = "v1.2.1" | Must match engine config |
| FC Scores | ⚠️ | May fail due to empty FC infrastructure | Secondary issue |
| Results Access | ⏳ | Token required, returns 200 with token | Security enforcement |
| Function Logs | ⏳ | No critical errors or version overrides | Operational health |

## Known Issues Remaining

### FC Infrastructure Empty ⚠️
- `fc_blocks`: 0 rows
- `fc_options`: 0 rows  
- Impact: FC scoring will fail/fallback
- Next: Requires IR-07B (FC Seeding)

### Backfill Needed 📋
- 40+ sessions need profile generation
- 20+ day data gap to restore
- Next: Requires IR-08A (Backfill)

## Success Definition

**MINIMUM FOR STAGE PROMOTION:**
- ✅ Profile creation works (test session generates profile)
- ✅ Version stamping correct (v1.2.1)
- ✅ Results access secured (token enforcement)
- ✅ No critical function errors

**FULL RECOVERY:**
- ✅ All above criteria
- ✅ FC infrastructure seeded
- ✅ Historical sessions backfilled

---
**Next Steps:**
1. Run verification tests immediately
2. If PASS: Proceed to FC seeding (IR-07B)  
3. If FAIL: Debug remaining issues before continuing