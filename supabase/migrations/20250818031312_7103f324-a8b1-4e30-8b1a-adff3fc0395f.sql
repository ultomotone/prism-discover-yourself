-- Drop and recreate assessment_sessions RLS policies to ensure anonymous access works

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow assessment session creation" ON assessment_sessions;
DROP POLICY IF EXISTS "Allow session updates" ON assessment_sessions;
DROP POLICY IF EXISTS "Only owner can read sessions" ON assessment_sessions;
DROP POLICY IF EXISTS "Anyone can create assessment sessions" ON assessment_sessions;
DROP POLICY IF EXISTS "Users can update assessment sessions" ON assessment_sessions;

-- Create policy to allow anyone (including anonymous users) to create sessions
CREATE POLICY "Enable insert for anonymous and authenticated users" 
ON assessment_sessions 
FOR INSERT 
WITH CHECK (true);

-- Allow users to update sessions they own OR anonymous sessions
CREATE POLICY "Enable update for session owners and anonymous" 
ON assessment_sessions 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  user_id IS NULL
);

-- Allow users to read their own sessions (no anonymous read needed for security)
CREATE POLICY "Enable read for session owners" 
ON assessment_sessions 
FOR SELECT 
USING (auth.uid() = user_id);