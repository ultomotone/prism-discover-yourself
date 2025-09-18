-- Fix RLS policies on assessment_sessions table to allow proper session linking
-- Drop conflicting policies that might be causing issues
DROP POLICY IF EXISTS "Users can view anonymous sessions they created via email" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Users can view their own assessment sessions" ON public.assessment_sessions;

-- Create a unified policy that allows authenticated users to view:
-- 1. Sessions they own (user_id = auth.uid())  
-- 2. Anonymous sessions with their email (user_id IS NULL AND email matches)
CREATE POLICY "Authenticated users can view their sessions and anonymous by email"
  ON public.assessment_sessions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() 
      OR (user_id IS NULL AND email IS NOT NULL AND email = (auth.jwt() ->> 'email'))
    )
  );

-- Ensure anonymous users can still read sessions for response validation (unchanged)
-- The existing "Allow reading sessions for response validation" policy should handle this