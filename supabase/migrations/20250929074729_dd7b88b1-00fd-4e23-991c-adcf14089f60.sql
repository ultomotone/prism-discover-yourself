-- Create the missing start_assessment_with_cleanup function
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
  -- First, check for any existing in_progress sessions for this user
  IF p_email IS NOT NULL THEN
    SELECT id INTO existing_session_id
    FROM public.assessment_sessions
    WHERE email = p_email 
      AND status = 'in_progress'
      AND created_at > NOW() - INTERVAL '24 hours'  -- Only consider recent sessions
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If we found an existing session, return it
    IF existing_session_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'success', true,
        'session_id', existing_session_id,
        'existing_session', true
      );
    END IF;
    
    -- Clean up old abandoned sessions
    UPDATE public.assessment_sessions
    SET status = 'abandoned'
    WHERE email = p_email 
      AND status = 'in_progress'
      AND created_at < NOW() - INTERVAL '24 hours';
  END IF;
  
  -- Create new session
  new_session_id := gen_random_uuid();
  new_share_token := gen_random_uuid();
  
  INSERT INTO public.assessment_sessions (
    id,
    user_id,
    email,
    session_type,
    share_token,
    status,
    total_questions
  ) VALUES (
    new_session_id,
    p_user_id,
    p_email,
    'prism',
    new_share_token,
    'in_progress',
    249  -- Default question count
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'session_id', new_session_id,
    'share_token', new_share_token,
    'existing_session', false
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;