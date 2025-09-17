-- IR-07A: RLS Remediation for profiles table
-- CRITICAL: Restore service role write access to profiles table

-- Step 1: Enable RLS on profiles table (if not already enabled)
-- Current state: RLS enabled but NO POLICIES exist = ALL ACCESS DENIED

-- Step 2: Add service role management policy
CREATE POLICY "Service role can manage profiles" 
ON public.profiles 
FOR ALL 
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Step 3: Add owner-read policy for authenticated users
CREATE POLICY "Users can view their own profiles" 
ON public.profiles 
FOR SELECT 
TO public
USING (auth.uid() = user_id);

-- Verification queries (run after apply):
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles';

-- Expected result: 2 policies
-- 1. "Service role can manage profiles" - FOR ALL with service_role check
-- 2. "Users can view their own profiles" - FOR SELECT with auth.uid() = user_id