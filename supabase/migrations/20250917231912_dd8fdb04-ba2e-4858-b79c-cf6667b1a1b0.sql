-- Fix RLS policies for assessment_sessions to allow authenticated users to access their own data
CREATE POLICY "Users can view their own assessment sessions" 
ON public.assessment_sessions 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    email = auth.jwt()->>'email'
  )
);

CREATE POLICY "Users can view anonymous sessions they created via email" 
ON public.assessment_sessions 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  user_id IS NULL AND 
  email IS NOT NULL AND 
  email = auth.jwt()->>'email'
);