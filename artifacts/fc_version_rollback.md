# FC VERSION ROLLBACK PLAN

**Scope**: Revert FC version normalization changes if needed  
**Files**: 2 frontend files, 1 optional function enhancement

## ROLLBACK STEPS

### 1. Revert RealFCBlock.tsx
**File**: `src/components/assessment/RealFCBlock.tsx`  

**Line 50**: Revert FC blocks query
```typescript
// Revert TO:
.eq('version', 'v1.1')  
// FROM:
.eq('version', 'v1.2') 
```

**Line 163**: Revert function call
```typescript
// Revert TO:
version: 'v1.1'
// FROM: 
version: 'v1.2'
```

### 2. Revert fcBlockService.ts  
**File**: `src/services/fcBlockService.ts`

**Line 163**: Revert function call
```typescript
// Revert TO:
version: 'v1.1'  
// FROM:
version: 'v1.2'
```

### 3. Remove Function Warning (If Added)
**File**: `supabase/functions/score_fc_session/index.ts`

Remove version validation warning code:
```typescript
// REMOVE this block if added:
if (!version || version === 'v1.1') {
  console.warn(`evt:fc_version_mismatch,session_id:${session_id},version:${version || 'undefined'},expected:v1.2`);
  version = version || 'v1.2';
}
```

## POST-ROLLBACK STATE

After rollback:
- ✅ Frontend calls use v1.1 (original state)
- ✅ FC infrastructure remains v1.2 (seeded data unchanged)  
- ⚠️ **Version mismatch restored** - FC calls won't find v1.1 blocks
- ❌ FC scoring will return "no fc responses" until re-seeded with v1.1

## ROLLBACK VERIFICATION

1. **Check frontend calls**: Confirm v1.1 in RealFCBlock and fcBlockService
2. **Test FC blocks query**: Verify no blocks found (expected with v1.1 query)
3. **Monitor logs**: Should see "no blocks" messages in score_fc_session

## ALTERNATIVE: Rollback FC Infrastructure  

If preferred, rollback FC seeding instead:
```sql
-- Option: Rollback fc_blocks/fc_options to v1.1
UPDATE fc_blocks SET version = 'v1.1' WHERE version = 'v1.2';
DELETE FROM fc_scores WHERE version = 'v1.2';
```

**Note**: This would require re-seeding v1.1 FC data, which is more complex than the frontend rollback.

---

**RECOMMENDATION**: Keep v1.2 normalization - simpler and aligns with infrastructure  
**FALLBACK**: Frontend rollback above if critical issues arise