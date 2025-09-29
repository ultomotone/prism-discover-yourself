-- Update existing sessions to have correct question counts
UPDATE public.assessment_sessions 
SET completed_questions = (
  SELECT COUNT(*) 
  FROM public.assessment_responses 
  WHERE session_id = assessment_sessions.id
),
total_questions = CASE 
  WHEN status = 'completed' THEN 248 
  ELSE 248 
END,
updated_at = now()
WHERE completed_questions = 0 OR total_questions = 0;