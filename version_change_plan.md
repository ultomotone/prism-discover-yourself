# PRISM Engine Version Alignment Plan

## Change Overview

**Goal**: Align all system components to consistent versioning  
**Target Engine**: v1.2.1  
**Target FC**: v1.2  
**Priority**: Medium (functional system, config drift only)

---

## Proposed Changes

### 1. Database Configuration Update (CRITICAL)

**Current State**: `scoring_config.results_version = "v1.1.2"`  
**Target State**: `scoring_config.results_version = "v1.2.1"`

```sql
-- Idempotent update for results_version
UPDATE public.scoring_config 
SET value = '"v1.2.1"'::jsonb,
    updated_at = now()
WHERE key = 'results_version'
  AND value != '"v1.2.1"'::jsonb;

-- Verify update
SELECT key, value, updated_at 
FROM public.scoring_config 
WHERE key = 'results_version';
```

**Impact**: Configuration queries will return correct version  
**Risk**: Low - engine hardcodes v1.2.1 as safety override

---

### 2. Shared Library Version Bump (CONSISTENCY)

**Files to Update**:
- `supabase/functions/_shared/calibration.ts:35`
- `supabase/functions/_shared/config.ts:77`

**Current**: `private version = 'v1.2.0';`  
**Target**: `private version = 'v1.2.1';`

**Changes**:
```typescript
// calibration.ts
- private version = 'v1.2.0';
+ private version = 'v1.2.1';

// config.ts  
- private version = 'v1.2.0';
+ private version = 'v1.2.1';
```

**Impact**: Consistent telemetry and version reporting  
**Risk**: None - backward compatible change

---

### 3. Test Golden Files Update (MAINTENANCE)

**Files**: `supabase/functions/_shared/score-engine/__tests__/goldens/*.json`  
**Status**: Already at v1.2.1 ✅  
**Action**: No change required

---

## Implementation Timeline

### Phase 1: Database Config (5 minutes)
1. Execute SQL update for `results_version`
2. Verify configuration alignment  
3. Test config fetch in edge functions

### Phase 2: Code Updates (10 minutes)  
1. Update shared library version strings
2. Commit changes with version tag
3. Deploy edge functions

### Phase 3: Verification (5 minutes)
1. Confirm version consistency across components
2. Check telemetry reports correct versions
3. Validate no functional regressions

**Total Estimated Time**: 20 minutes

---

## Rollback Plan

### Database Rollback
```sql
-- Restore previous version if needed
UPDATE public.scoring_config 
SET value = '"v1.1.2"'::jsonb,
    updated_at = now()
WHERE key = 'results_version';
```

### Code Rollback
- Revert shared library version strings to v1.2.0
- Redeploy previous edge function versions
- Current engine hardcoding provides protection during rollback

### Rollback Triggers
- Configuration fetch errors increase >1%  
- Version mismatch alerts trigger
- Any scoring functionality degradation

---

## Validation Checklist

### Pre-Change Verification
- [ ] Current system functional (scoring working)
- [ ] Backup current `scoring_config` values
- [ ] Confirm edge function deployment pipeline ready

### Post-Change Verification  
- [ ] `scoring_config.results_version = "v1.2.1"`
- [ ] Shared libraries report v1.2.1
- [ ] `score_prism` output includes `results_version: "v1.2.1"`
- [ ] FC scoring continues using v1.2
- [ ] No increase in scoring errors

### Monitoring Points
- Edge function telemetry shows consistent versions
- Configuration queries return v1.2.1
- Profile creation stamps correct version
- FC scoring path logs show v1.2 usage

---

## Risk Mitigation

### Current Safety Nets
1. **Engine Hardcoding**: `score_prism` forces v1.2.1 regardless of config
2. **FC Version Lock**: Explicit v1.2 in `finalizeAssessment` call
3. **Non-Breaking**: All changes are version string updates only

### Additional Safeguards
- Database transaction for config update
- Gradual rollout possible (config-first, then code)
- Immediate rollback capability maintained

### Success Metrics
- Zero functional impact on scoring
- Version alignment across all components  
- Consistent telemetry and monitoring data

---

## Implementation Commands

### Execute Database Update
```bash
# Connect to Supabase and run:
psql $DATABASE_URL -c "
UPDATE public.scoring_config 
SET value = '\"v1.2.1\"'::jsonb,
    updated_at = now()
WHERE key = 'results_version';
"
```

### Deploy Code Changes
```bash
# After updating shared library files
git commit -m "feat: align shared library versions to v1.2.1"
git tag v1.2.1-alignment
git push origin main --tags
```

---

**APPROVAL REQUIRED**: No edits will be made until this plan is explicitly approved.