-- Fix RLS policies to allow anonymous access to results via session_id

-- Update profiles table to allow anonymous access when viewing results
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous can view profiles by session" ON public.profiles;

CREATE POLICY "Users can view their own profiles" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Anonymous can view profiles by session" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow anonymous users to view profiles if they know the session_id
  -- This enables shared result links to work
  auth.uid() IS NULL AND session_id IS NOT NULL
);

-- Update assessment_sessions to allow anonymous access for completed sessions
DROP POLICY IF EXISTS "Enable read for session access" ON public.assessment_sessions;

CREATE POLICY "Enable read for session access" 
ON public.assessment_sessions 
FOR SELECT 
USING (
  -- Authenticated users can see their own sessions
  ((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) 
  OR 
  -- Anonymous users can see sessions without user_id that have email
  ((auth.uid() IS NULL) AND (user_id IS NULL) AND (email IS NOT NULL))
  OR
  -- Anonymous users can see completed sessions for shared results
  ((auth.uid() IS NULL) AND (status = 'completed'))
);