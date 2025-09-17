-- Create RPC function to get sessions with emails for finalization
CREATE OR REPLACE FUNCTION public.get_sessions_with_emails_for_finalize(
  min_questions integer DEFAULT 248,
  limit_count integer DEFAULT 500
)
RETURNS TABLE(
  id uuid,
  email text,
  share_token text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  WITH email_responses AS (
    SELECT DISTINCT 
      ar.session_id,
      ar.answer_value as response_email
    FROM public.assessment_responses ar
    WHERE ar.question_text ILIKE '%email%'
      AND ar.answer_value IS NOT NULL
      AND ar.answer_value != ''
      AND ar.answer_value LIKE '%@%'
  ),
  sessions_with_emails AS (
    SELECT 
      s.id,
      COALESCE(s.email, er.response_email) as email,
      s.share_token,
      s.updated_at
    FROM public.assessment_sessions s
    LEFT JOIN email_responses er ON s.id = er.session_id
    WHERE s.status = 'completed'
      AND s.completed_questions >= min_questions
      AND (s.email IS NOT NULL OR er.response_email IS NOT NULL)
      AND (s.email != '' OR er.response_email != '')
  )
  SELECT 
    swe.id,
    swe.email,
    swe.share_token
  FROM sessions_with_emails swe
  ORDER BY swe.updated_at DESC
  LIMIT limit_count;
END;
$function$;