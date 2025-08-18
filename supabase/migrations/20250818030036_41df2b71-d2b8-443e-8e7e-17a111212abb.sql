-- Fix RLS policy for assessment_sessions to allow anonymous assessment creation
DROP POLICY IF EXISTS "Anyone can create assessment sessions" ON assessment_sessions;
DROP POLICY IF EXISTS "Users can update assessment sessions" ON assessment_sessions;

-- Allow anyone to create assessment sessions (including anonymous users)
CREATE POLICY "Allow assessment session creation" 
ON assessment_sessions 
FOR INSERT 
WITH CHECK (true);

-- Allow users to update their own sessions, including anonymous updates by session ownership
CREATE POLICY "Allow session updates" 
ON assessment_sessions 
FOR UPDATE 
USING (
  -- Allow if user owns the session OR if updating an anonymous session
  (user_id IS NOT NULL AND auth.uid() = user_id) 
  OR 
  (user_id IS NULL)
);