-- Create trigger to update progress as responses come in
CREATE OR REPLACE FUNCTION update_session_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the session's completed_questions count
  UPDATE public.assessment_sessions 
  SET 
    completed_questions = (
      SELECT COUNT(*) 
      FROM public.assessment_responses 
      WHERE session_id = NEW.session_id
    ),
    total_questions = CASE 
      WHEN total_questions = 0 THEN 248 
      ELSE total_questions 
    END,
    updated_at = now()
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_session_progress ON public.assessment_responses;

-- Create trigger on assessment_responses
CREATE TRIGGER trigger_update_session_progress
  AFTER INSERT OR UPDATE OR DELETE ON public.assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_session_progress();