-- Update the start_assessment function to prevent multiple open sessions
CREATE OR REPLACE FUNCTION public.start_assessment_with_cleanup(p_email text, p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_session_id uuid;
  new_session_id uuid;
  new_share_token text;
BEGIN
  -- If user_id is provided, cleanup any existing in_progress sessions for this user
  IF p_user_id IS NOT NULL THEN
    -- Mark any existing in_progress sessions as abandoned
    UPDATE public.assessment_sessions 
    SET status = 'abandoned', 
        updated_at = now()
    WHERE user_id = p_user_id 
      AND status = 'in_progress';
  END IF;
  
  -- If email is provided, cleanup any existing in_progress sessions for this email
  IF p_email IS NOT NULL THEN
    -- Mark any existing in_progress sessions as abandoned  
    UPDATE public.assessment_sessions
    SET status = 'abandoned',
        updated_at = now() 
    WHERE email = p_email
      AND status = 'in_progress';
  END IF;
  
  -- Generate new session
  new_session_id := gen_random_uuid();
  new_share_token := public.make_share_token();
  
  -- Create new session
  INSERT INTO public.assessment_sessions (
    id,
    user_id, 
    email,
    status,
    share_token,
    session_type,
    started_at
  ) VALUES (
    new_session_id,
    p_user_id,
    p_email,
    'in_progress',
    new_share_token,
    'prism',
    now()
  );
  
  RETURN jsonb_build_object(
    'session_id', new_session_id,
    'share_token', new_share_token,
    'status', 'success'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', SQLERRM
    );
END;
$$;