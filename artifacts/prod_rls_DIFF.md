# Production RLS Fix - DIFF Summary

**Session ID**: 618c5ea6-aeda-4084-9156-0aac9643afd3
**FC Version**: v1.2
**Environment**: Production (gnkuikentdtnatazeriu)

## Current State

| Table | RLS Status | Current Issues |
|-------|------------|----------------|
| profiles | ✅ Enabled, Forced | Missing service role policy |
| fc_scores | ✅ Enabled, Not Forced | Missing service role policy |

## Proposed Changes

### 1. Service Role Policies (Idempotent)

**Add to `public.profiles`:**
```sql
create policy "svc_manage_profiles"
  on public.profiles
  for all
  to public
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
```

**Add to `public.fc_scores`:**
```sql
create policy "svc_manage_fc_scores"
  on public.fc_scores
  for all
  to public
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
```

## Risk Assessment

- **Risk Level**: LOW
- **Rollback Available**: ✅ Yes (migrations/prod_rls_rollback.sql)
- **Idempotent**: ✅ Yes (checks for existing policies)
- **Impact**: Enables finalizeAssessment function to write to both tables

## Files Created

- `migrations/prod_rls_apply.sql` - Apply script
- `migrations/prod_rls_rollback.sql` - Rollback script

## Next Steps

**🛑 APPROVAL GATE REACHED**

Ready to apply RLS fixes to Production. Please review and respond with **"APPROVE RLS APPLY"** to proceed with PHASE C.