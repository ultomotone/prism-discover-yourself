# IR-07B FC VERSION NORMALIZATION - DRY RUN DIFF

**Target**: Eliminate v1.1 references in FC-related code paths  
**Scope**: Only FC scoring functions (avoid touching unrelated v1.1 constants)  
**Version**: Normalize to v1.2 (matches FC infrastructure)

## FC-SPECIFIC CHANGES REQUIRED

### 1. RealFCBlock.tsx (Line 163)
**File**: `src/components/assessment/RealFCBlock.tsx`  
**Current**:
```typescript
const { data, error } = await supabase.functions.invoke('score_fc_session', {
  body: {
    session_id: sessionId,
    basis: 'functions',
    version: 'v1.1'  // ← WRONG VERSION
  }
});
```
**Fixed**:
```typescript
const { data, error } = await supabase.functions.invoke('score_fc_session', {
  body: {
    session_id: sessionId,
    basis: 'functions',
    version: 'v1.2'  // ← CORRECT VERSION
  }
});
```

### 2. fcBlockService.ts (Line 163)
**File**: `src/services/fcBlockService.ts`  
**Current**:
```typescript
const { data, error } = await supabase.functions.invoke('score_fc_session', {
  body: {
    session_id: sessionId,
    basis: 'functions',
    version: 'v1.1'  // ← WRONG VERSION
  }
});
```
**Fixed**:
```typescript
const { data, error } = await supabase.functions.invoke('score_fc_session', {
  body: {
    session_id: sessionId,
    basis: 'functions',
    version: 'v1.2'  // ← CORRECT VERSION
  }
});
```

### 3. RealFCBlock.tsx FC Blocks Query (Line 50) 
**File**: `src/components/assessment/RealFCBlock.tsx`  
**Current**:
```typescript
.eq('version', 'v1.1')  // ← WRONG VERSION for FC blocks
```
**Fixed**:
```typescript
.eq('version', 'v1.2')  // ← CORRECT VERSION for FC blocks
```

## FILES NOT CHANGED (Non-FC v1.1 references)

The following files contain v1.1 references but are **NOT** FC-related and should remain unchanged:

- `src/components/CountryDistributionChart.tsx` - Admin analytics  
- `src/components/admin/*` - Admin UI and KPI references  
- `src/components/assessment/AssessmentForm.tsx` - Main assessment versioning  
- `src/components/assessment/ResultsV2.tsx` - Results display  
- `src/hooks/useAdminAnalytics.ts` - Analytics versioning  
- `src/pages/FirstHundredStudy.tsx` - Historical analysis  

**Rationale**: These are either admin/analytics views that reference results_version='v1.1' for existing data, or historical content. Only FC-specific function calls need v1.2 alignment.

## RUNTIME WARNING (Optional Enhancement)

**File**: `supabase/functions/score_fc_session/index.ts`  
**Addition**: Add version validation warning  
```typescript
// At line ~15, after version parsing:
if (!version || version === 'v1.1') {
  console.warn(`evt:fc_version_mismatch,session_id:${session_id},version:${version || 'undefined'},expected:v1.2`);
  version = version || 'v1.2'; // Default fallback
}
```

## COMPATIBILITY IMPACT

- ✅ **Forward Compatible**: v1.2 function works with v1.2 FC blocks/options
- ✅ **Backward Safe**: Non-FC v1.1 references preserved for existing data
- ✅ **No Breaking Changes**: Only FC scoring calls affected

## DEPLOYMENT SEQUENCE

1. **Frontend Changes**: Update client-side FC calls to use v1.2
2. **Function Enhancement**: Add version warning (optional)  
3. **Staging Deploy**: Functions auto-deploy with code changes
4. **Verification**: Re-run smoke test to confirm fc_scores.version='v1.2'

---

**CHANGES**: 3 lines in 2 files (FC-specific only)  
**RISK**: MINIMAL - Only affects FC scoring version alignment  
**ROLLBACK**: Simple - revert v1.2 → v1.1 in changed lines