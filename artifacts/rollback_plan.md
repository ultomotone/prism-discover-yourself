# Version Alignment Rollback Plan

## Database Rollback
```sql
-- Restore original results_version
UPDATE public.scoring_config 
SET value = '"v1.1.2"'::jsonb,
    updated_at = now()
WHERE key = 'results_version';

-- Verify rollback
SELECT key, value, updated_at 
FROM public.scoring_config 
WHERE key = 'results_version';
-- Expected: {"value": "v1.1.2"}
```

## Code Rollback

### 1. supabase/functions/_shared/calibration.ts
```typescript
// Line 35: Revert version
private version = 'v1.2.0';
```

### 2. supabase/functions/_shared/config.ts
```typescript
// Line 77: Revert version  
private version = 'v1.2.0';
```

### 3. supabase/functions/score_prism/index.ts
```typescript
// Remove telemetry lines (if added)
// Delete the engine_version_override logging block
```

## Rollback Triggers
- Configuration fetch errors increase >1%
- Version mismatch alerts trigger  
- Any scoring functionality degradation
- Failed verification tests

## Recovery Time
- **Database**: < 1 minute (single UPDATE statement)
- **Code Deployment**: < 5 minutes (revert + redeploy)
- **Full Recovery**: < 10 minutes total

## Verification Commands
```sql
-- Confirm DB rollback successful
SELECT key, value FROM scoring_config WHERE key = 'results_version';

-- Check no profiles affected
SELECT COUNT(*) FROM profiles WHERE results_version = 'v1.2.1';
```

## Emergency Contacts
- Database access: Admin console → SQL editor
- Function deployment: Automatic on git push
- Monitoring: Edge function logs for errors

## Rollback Success Criteria
- ✅ Database shows `results_version: "v1.1.2"`
- ✅ Shared libraries report `v1.2.0`
- ✅ No increase in scoring errors
- ✅ Test assessments complete successfully
- ✅ No version mismatch alerts