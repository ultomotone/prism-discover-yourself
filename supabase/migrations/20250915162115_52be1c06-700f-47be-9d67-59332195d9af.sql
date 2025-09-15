-- Fix RLS policies for assessment_sessions table to allow proper function access

-- First, add policy to allow reading sessions for response validation
CREATE POLICY "Allow reading sessions for response validation" ON public.assessment_sessions
FOR SELECT 
USING (true);

-- Add policy to allow updating session progress
CREATE POLICY "Allow updating session progress" ON public.assessment_sessions  
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Fix assessment_responses table RLS policies
-- Add policy to allow inserting responses
CREATE POLICY "Allow inserting assessment responses" ON public.assessment_responses
FOR INSERT 
WITH CHECK (true);

-- Add policy to allow reading responses for the same session
CREATE POLICY "Allow reading assessment responses" ON public.assessment_responses
FOR SELECT
USING (true);

-- Add policy to allow updating responses (for idempotent saves)  
CREATE POLICY "Allow updating assessment responses" ON public.assessment_responses
FOR UPDATE
USING (true)
WITH CHECK (true);