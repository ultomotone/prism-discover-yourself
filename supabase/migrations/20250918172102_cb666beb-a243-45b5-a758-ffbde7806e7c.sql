-- DEV MODE: Temporarily disable RLS for debugging
-- IMPORTANT: This is for development only - re-enable RLS before production!

-- Disable RLS on target tables
ALTER TABLE public.assessment_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses DISABLE ROW LEVEL SECURITY;

-- Grant privileges to authenticated users for read/write access
-- This allows the app to function without 403 errors

-- assessment_sessions: read/write for authenticated users
GRANT SELECT, INSERT, UPDATE ON public.assessment_sessions TO authenticated;

-- scoring_results: read/write for authenticated users  
GRANT SELECT, INSERT, UPDATE ON public.scoring_results TO authenticated;

-- profiles: read/write for authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- assessment_responses: read/write for authenticated users
GRANT SELECT, INSERT, UPDATE ON public.assessment_responses TO authenticated;

-- Note: Keep service_role permissions intact for edge functions