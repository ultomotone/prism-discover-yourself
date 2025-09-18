# Dev Mode (RLS OFF) - Temporary Security Bypass

🚨 **WARNING**: This configuration has **ROW LEVEL SECURITY DISABLED** on critical tables for debugging purposes. This is **TEMPORARILY UNSAFE** and must be re-secured before production!

## What Was Changed

### 1. RLS Disabled on Tables
```sql
-- Tables with RLS DISABLED (dangerous!)
ALTER TABLE public.assessment_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results DISABLE ROW LEVEL SECURITY; 
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses DISABLE ROW LEVEL SECURITY;
```

### 2. Authenticated User Grants
```sql
-- Granted read/write access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.assessment_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.scoring_results TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.assessment_responses TO authenticated;
```

### 3. Fixed Duplicate Supabase Client
- Consolidated all imports to use `@/integrations/supabase/client`
- Removed duplicate client in `src/lib/supabase/client.ts`
- This fixes the "Multiple GoTrueClient instances" warning

## Quick Verification

### Test via Console
```javascript
// Open browser dev tools and run:
import { quickTest } from '@/utils/testDbAccess';
await quickTest();
```

### Test via Code
```typescript
import { runAllTests, testAssessmentSessionsAccess } from '@/utils/testDbAccess';

// Test all tables
const results = await runAllTests();
console.log('All tests passed:', results.every(r => r.success));

// Test specific table  
const sessionTest = await testAssessmentSessionsAccess();
console.log('Sessions accessible:', sessionTest.success);
```

### Expected Results
- ✅ No more 403 Forbidden errors on table reads
- ✅ Client writes/updates succeed 
- ✅ Realtime subscriptions work
- ✅ Single Supabase client (no duplicate warnings)

### Test Queries That Should Now Work
```sql
-- These should return data (not 403)
SELECT id, email, status FROM assessment_sessions LIMIT 5;
SELECT id, session_id, type_code FROM profiles LIMIT 5;
SELECT id, session_id, type_code FROM scoring_results LIMIT 5;
```

## Current Security Status
- 🔴 **HIGH RISK**: Tables are fully accessible to any authenticated user
- 🔴 **DATA EXPOSURE**: User data is not isolated by ownership
- 🔴 **NO ACCESS CONTROL**: Any logged-in user can read/modify any data
- ⚠️ **SERVICE ROLE**: Edge functions retain full access (unchanged)

## Re-Security Checklist

**BEFORE GOING TO PRODUCTION**, you MUST:

### 1. Re-enable RLS
```sql
-- Re-enable Row Level Security
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
```

### 2. Restore Proper Policies
```sql
-- Example: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON assessment_sessions
  FOR SELECT USING (user_id = auth.uid());

-- Example: Users can only see their own profiles  
CREATE POLICY "Users can view own profiles" ON profiles
  FOR SELECT USING (user_id = auth.uid());

-- Example: Service role has full access
CREATE POLICY "Service role full access" ON assessment_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
```

### 3. Revoke Broad Grants  
```sql 
-- Remove the overly permissive grants
REVOKE SELECT, INSERT, UPDATE ON public.assessment_sessions FROM authenticated;
REVOKE SELECT, INSERT, UPDATE ON public.scoring_results FROM authenticated;
REVOKE SELECT, INSERT, UPDATE ON public.profiles FROM authenticated;
REVOKE SELECT, INSERT, UPDATE ON public.assessment_responses FROM authenticated;
```

### 4. Test RLS Policies
- Verify authenticated users can only access their own data
- Verify anonymous users have appropriate read-only access
- Verify service role retains full access for edge functions
- Run security linter to catch any issues

## Files Modified
- `src/contexts/AuthContext.tsx` - Fixed client import
- `src/features/results/api.ts` - Fixed client import  
- `src/components/assessment/AssessmentForm.tsx` - Fixed client import
- `src/components/assessment/RealFCBlock.tsx` - Fixed client import
- `src/hooks/useEmailSessionManager.ts` - Fixed client import
- `src/hooks/useEvidenceAnalytics.ts` - Fixed client import
- `src/lib/api/admin.ts` - Fixed client import
- `src/pages/Assessment.tsx` - Fixed client import
- `src/pages/ResetPassword.tsx` - Fixed client import
- `src/scripts/seedFixtures.ts` - Fixed client import
- `src/services/fcBlockService.ts` - Fixed client import
- `src/components/SystemStatusIndicator.tsx` - Fixed client import
- `src/components/admin/SystemStatusControl.tsx` - Fixed client import
- `src/utils/testDbAccess.ts` - **NEW** Test utility

## Files Created
- `src/utils/testDbAccess.ts` - Database access testing utility
- `DEV_MODE_RLS_OFF.md` - This documentation

## Files Removed
- `src/lib/supabase/client.ts` - Removed duplicate client

---

**Remember**: This is a temporary debugging configuration. Re-enable security before production deployment!