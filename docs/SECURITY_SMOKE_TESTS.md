# Security Smoke Tests - Post-Lockdown

Run these tests to verify the security lockdown is working correctly while preserving functionality.

## ✅ Tests That Should SUCCEED

### 1. Anonymous Assessment Flow
```bash
# Should work - anonymous can take assessments
1. Visit your app without logging in
2. Start an assessment 
3. Submit responses
4. Complete assessment
✅ Expected: Assessment completes successfully
```

### 2. Results Reading (Public)
```bash
# Should work - results are readable by all
GET /functions/v1/get-results-by-session
Body: { "session_id": "YOUR_SESSION_ID", "share_token": "YOUR_TOKEN" }
✅ Expected: Returns results data
```

### 3. Health Check Access
```bash
# Should work - health endpoint is public
GET /functions/v1/health-check-scoring
✅ Expected: Returns system health data
```

### 4. Service Role Operations
```bash
# Should work - admin functions use service role
POST /functions/v1/admin-backfill-scoring_results
✅ Expected: Backfill processes successfully
```

## ❌ Tests That Should FAIL (Security Working)

### 1. Direct Table Writes with Anon Key
```javascript
// Should fail - anon cannot write to scoring_results
const { error } = await supabase
  .from('scoring_results')
  .insert({ 
    session_id: 'test', 
    payload: {}, 
    scoring_version: 'v1.2.1' 
  });
❌ Expected: Permission denied / RLS violation
```

### 2. Config Table Modification
```javascript
// Should fail - anon cannot modify configs
const { error } = await supabase
  .from('scoring_config')
  .update({ value: '"hacked"' })
  .eq('key', 'results_version');
❌ Expected: Permission denied / RLS violation  
```

### 3. Log Access
```javascript
// Should fail - anon cannot read logs
const { error } = await supabase
  .from('fn_logs')
  .select('*');
❌ Expected: Permission denied / No access
```

### 4. Legacy Result Table Writes
```javascript
// Should fail - anon cannot write to legacy tables
const { error } = await supabase
  .from('profiles')
  .insert({ 
    session_id: 'test', 
    type_code: 'ENFP' 
  });
❌ Expected: Permission denied / RLS violation
```

## Phase 2 Transition Tests

### 1. Set Single-Write Mode
```bash
# Set environment variable
PRISM_WRITE_EXPLODED=false
```

### 2. Complete New Assessment
```bash
1. Take a new assessment with single-write mode ON
2. Check database tables:
   - scoring_results: should have NEW row ✅
   - profiles: should NOT have new row ❌
   - scoring_results_types: should NOT have new rows ❌
```

### 3. Performance Monitoring
```bash
# Check edge function logs for:
- persistResultsV3_complete: { total_ms: <100, served_from_cache: false }
- results.unified_cache_hit: { served_from_cache: true }
- No persistResultsV3_unified_failed errors
```

## Rollback Test

### If Issues Found:
```bash
# Emergency rollback
PRISM_WRITE_EXPLODED=true

# Verify dual-write resumes:
1. Complete assessment
2. Check BOTH scoring_results AND legacy tables have new data
3. Results reading still works
```

## Monitoring Commands

### Database Verification:
```sql
-- Run verification queries
\i sql/security_verification.sql

-- Check recent activity
SELECT COUNT(*) FROM scoring_results WHERE computed_at >= now() - interval '1 hour';
SELECT COUNT(*) FROM profiles WHERE computed_at >= now() - interval '1 hour';
```

### Health Check:
```bash
curl -X GET https://YOUR_PROJECT.supabase.co/functions/v1/health-check-scoring
```

---

**Success Criteria:**
- ✅ Anonymous assessments work
- ✅ Results reading works  
- ❌ Direct writes to sensitive tables fail
- ❌ Config modifications fail
- ✅ Service role operations work
- ✅ Single-write mode functions properly