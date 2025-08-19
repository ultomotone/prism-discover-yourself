-- Remove earliest 10 assessments, excluding the specified LIE session
DO $$
DECLARE
  keep_session uuid := 'c6970644-8b35-4128-b5c4-53dd292141a9';
BEGIN
  -- Collect earliest profiles to remove (excluding the keep_session)
  WITH to_remove AS (
    SELECT id, session_id
    FROM public.profiles
    WHERE session_id <> keep_session
    ORDER BY created_at ASC
    LIMIT 10
  )
  -- Delete dependent assessment_responses
  , del_responses AS (
    DELETE FROM public.assessment_responses ar
    USING to_remove t
    WHERE ar.session_id = t.session_id
    RETURNING ar.session_id
  )
  -- Delete dependent assessment_sessions
  , del_sessions AS (
    DELETE FROM public.assessment_sessions s
    USING to_remove t
    WHERE s.id = t.session_id
    RETURNING s.id
  )
  -- Finally delete the profiles
  DELETE FROM public.profiles p
  USING to_remove t
  WHERE p.id = t.id;
END $$;