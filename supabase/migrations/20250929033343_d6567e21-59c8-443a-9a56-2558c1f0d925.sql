-- Function to delete specific session and all related data
CREATE OR REPLACE FUNCTION delete_specific_session(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if session exists
  IF NOT EXISTS (SELECT 1 FROM public.assessment_sessions WHERE id = p_session_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Session not found'
    );
  END IF;

  -- Delete assessment responses
  DELETE FROM public.assessment_responses WHERE session_id = p_session_id;
  
  -- Delete forced choice responses
  DELETE FROM public.fc_responses WHERE session_id = p_session_id;
  
  -- Delete forced choice scores
  DELETE FROM public.fc_scores WHERE session_id = p_session_id;
  
  -- Delete profiles if any
  DELETE FROM public.profiles WHERE session_id = p_session_id;
  
  -- Delete the session
  DELETE FROM public.assessment_sessions WHERE id = p_session_id;
  
  -- Log the deletion
  INSERT INTO public.fn_logs(evt, payload)
  VALUES ('manual_session_delete', jsonb_build_object(
    'session_id', p_session_id,
    'deleted_at', NOW()
  ));
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Session deleted successfully',
    'session_id', p_session_id
  );
END;
$$;