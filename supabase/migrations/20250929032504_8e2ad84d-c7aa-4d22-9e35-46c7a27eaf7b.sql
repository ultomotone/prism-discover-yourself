-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to clean up old incomplete sessions
CREATE OR REPLACE FUNCTION cleanup_old_incomplete_sessions()
RETURNS TABLE(deleted_count integer, session_ids uuid[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_sessions uuid[];
  delete_count integer := 0;
BEGIN
  -- Find sessions to delete (older than 7 days, not completed, less than 147 responses)
  WITH sessions_to_delete AS (
    SELECT s.id
    FROM public.assessment_sessions s
    LEFT JOIN (
      SELECT session_id, COUNT(*) as response_count
      FROM public.assessment_responses
      GROUP BY session_id
    ) r ON r.session_id = s.id
    WHERE s.started_at < NOW() - INTERVAL '7 days'
    AND s.status != 'completed'
    AND COALESCE(r.response_count, 0) < 147
  )
  SELECT ARRAY(SELECT id FROM sessions_to_delete) INTO deleted_sessions;
  
  -- Delete assessment responses first (foreign key constraint)
  DELETE FROM public.assessment_responses 
  WHERE session_id = ANY(deleted_sessions);
  
  -- Delete forced choice responses
  DELETE FROM public.fc_responses 
  WHERE session_id = ANY(deleted_sessions);
  
  -- Delete forced choice scores
  DELETE FROM public.fc_scores 
  WHERE session_id = ANY(deleted_sessions);
  
  -- Delete the sessions themselves
  DELETE FROM public.assessment_sessions 
  WHERE id = ANY(deleted_sessions);
  
  GET DIAGNOSTICS delete_count = ROW_COUNT;
  
  -- Log the cleanup operation
  INSERT INTO public.fn_logs(evt, payload)
  VALUES ('session_cleanup', jsonb_build_object(
    'deleted_count', delete_count,
    'deleted_sessions', deleted_sessions,
    'cleanup_date', NOW()
  ));
  
  RETURN QUERY SELECT delete_count, deleted_sessions;
END;
$$;

-- Schedule the cleanup to run daily at 2 AM UTC
SELECT cron.schedule(
  'cleanup-old-sessions',
  '0 2 * * *', -- Every day at 2 AM
  $$
  SELECT cleanup_old_incomplete_sessions();
  $$
);

-- Create a manual trigger function for immediate cleanup (optional)
CREATE OR REPLACE FUNCTION trigger_session_cleanup()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result record;
BEGIN
  SELECT * INTO result FROM cleanup_old_incomplete_sessions();
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', result.deleted_count,
    'deleted_sessions', result.session_ids,
    'message', format('Deleted %s old incomplete sessions', result.deleted_count)
  );
END;
$$;