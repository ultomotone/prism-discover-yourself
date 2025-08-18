-- Add email field to assessment_sessions for email-based save/resume
ALTER TABLE public.assessment_sessions 
ADD COLUMN email TEXT;

-- Create index for email lookups
CREATE INDEX idx_assessment_sessions_email ON public.assessment_sessions(email);

-- Update RLS policy to allow email-based access
CREATE POLICY "Enable read for email-based sessions" 
ON public.assessment_sessions 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR (user_id IS NULL AND email IS NOT NULL)
);

-- Allow updates for email-based sessions
CREATE POLICY "Enable update for email-based sessions" 
ON public.assessment_sessions 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR (user_id IS NULL AND email IS NOT NULL)
);

-- Drop the old update policy since we're replacing it
DROP POLICY "Enable update for session owners and anonymous" ON public.assessment_sessions;