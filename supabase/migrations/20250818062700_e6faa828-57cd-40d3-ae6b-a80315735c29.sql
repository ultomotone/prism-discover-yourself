-- Fix RLS policies for anonymous users with saved sessions
DROP POLICY IF EXISTS "Enable read for all session access" ON public.assessment_sessions;

-- Create a policy that properly handles anonymous users with saved emails
CREATE POLICY "Enable read for session access" 
ON public.assessment_sessions 
FOR SELECT 
USING (
  -- Authenticated users can see their own sessions
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR 
  -- Anonymous users can see sessions they saved with email (user_id null + email exists)
  (auth.uid() IS NULL AND user_id IS NULL AND email IS NOT NULL)
);