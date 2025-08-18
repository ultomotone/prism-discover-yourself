-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read for session owners" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Enable read for email-based sessions" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Enable update for email-based sessions" ON public.assessment_sessions;

-- Create a comprehensive SELECT policy that handles both cases
CREATE POLICY "Enable read for all session access" 
ON public.assessment_sessions 
FOR SELECT 
USING (
  -- Authenticated users can see their own sessions
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR 
  -- Anonymous users can see email-based sessions (user_id is null and email exists)
  (user_id IS NULL AND email IS NOT NULL)
  OR
  -- Also allow if session has an email and no specific user_id (covers edge cases)
  (email IS NOT NULL AND user_id IS NULL)
);

-- Create a comprehensive UPDATE policy  
CREATE POLICY "Enable update for all session access" 
ON public.assessment_sessions 
FOR UPDATE 
USING (
  -- Authenticated users can update their own sessions
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR 
  -- Anonymous users can update email-based sessions
  (user_id IS NULL AND email IS NOT NULL)
  OR
  -- Allow updates for sessions without user_id (anonymous sessions)
  (user_id IS NULL)
);