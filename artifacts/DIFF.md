# Version Alignment Changes - DRY RUN PREVIEW

## Database Migration
```sql
-- Update results_version configuration (IDEMPOTENT)
UPDATE public.scoring_config 
SET value = '"v1.2.1"'::jsonb, 
    updated_at = now()
WHERE key = 'results_version' 
  AND value != '"v1.2.1"'::jsonb;

-- Verification query
SELECT key, value, updated_at 
FROM public.scoring_config 
WHERE key = 'results_version';
```

## Code Changes

### 1. supabase/functions/_shared/calibration.ts
```diff
  export class PrismCalibration {
    private supabase: SupabaseClient;
-   private version = 'v1.2.0';
+   private version = 'v1.2.1';
```

### 2. supabase/functions/_shared/config.ts  
```diff
  export class PrismConfigManager {
    private supabase: SupabaseClient;
-   private version = 'v1.2.0';
+   private version = 'v1.2.1';
```

### 3. supabase/functions/score_prism/index.ts (Telemetry Addition)
```diff
+ // Emit telemetry if database config doesn't match engine expectation
+ if (cfg.results_version && cfg.results_version !== "v1.2.1") {
+   console.log(`evt:engine_version_override,db_version:${cfg.results_version},engine_version:v1.2.1`);
+ }
+
  const profileRow = {
    ...profile,
    session_id,
    submitted_at: existing?.submitted_at || now,
    recomputed_at: existing ? now : null,
    created_at: existing?.submitted_at || now,
    updated_at: now,
    results_version: "v1.2.1", // Override maintained for safety
    version: "v1.2.1",
  };
```

## Impact Analysis
- **User-Visible Changes**: NONE
- **API Behavior**: UNCHANGED  
- **Performance**: NONE (version string updates only)
- **Backwards Compatibility**: MAINTAINED

## Rollback Plan
```sql
-- Restore previous database value
UPDATE public.scoring_config 
SET value = '"v1.1.2"'::jsonb,
    updated_at = now()
WHERE key = 'results_version';
```

```typescript
// Revert shared library versions
private version = 'v1.2.0'; // In both calibration.ts and config.ts
```

## Files Modified
- `scoring_config` table (1 row update)
- `supabase/functions/_shared/calibration.ts` (1 line)
- `supabase/functions/_shared/config.ts` (1 line)  
- `supabase/functions/score_prism/index.ts` (3 lines added)

**Total Changes**: 6 lines across 3 files + 1 DB update

---

**APPROVAL REQUIRED**: Confirm to proceed with these minimal changes.