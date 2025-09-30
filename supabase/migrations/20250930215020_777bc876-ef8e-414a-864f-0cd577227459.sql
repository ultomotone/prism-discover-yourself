-- Create function to refresh all materialized views for analytics
CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_start timestamptz := now();
  v_views text[] := ARRAY[
    'mv_kpi_sessions',
    'mv_kpi_scoring',
    'mv_kpi_feedback',
    'mv_kpi_item_flags',
    'mv_kpi_item_timing',
    'mv_kpi_engagement',
    'mv_kpi_item_flow',
    'mv_kpi_item_clarity',
    'mv_kpi_response_process',
    'mv_kpi_reliability',
    'mv_kpi_cfa',
    'mv_kpi_construct_coverage',
    'mv_kpi_fairness_dif',
    'mv_kpi_calibration',
    'mv_kpi_classification_stability',
    'mv_kpi_confidence_spread',
    'mv_kpi_user_experience',
    'mv_kpi_business',
    'mv_kpi_followup',
    'mv_kpi_behavioral_impact',
    'mv_kpi_trajectory_alignment'
  ];
  v_view text;
  v_refreshed int := 0;
  v_errors jsonb := '[]'::jsonb;
BEGIN
  -- Loop through each materialized view and refresh it
  FOREACH v_view IN ARRAY v_views
  LOOP
    BEGIN
      -- Check if the view exists first
      IF EXISTS (
        SELECT 1 FROM pg_matviews 
        WHERE schemaname = 'public' 
        AND matviewname = v_view
      ) THEN
        EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I', v_view);
        v_refreshed := v_refreshed + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors || jsonb_build_object(
        'view', v_view,
        'error', SQLERRM
      );
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'refreshed_count', v_refreshed,
    'duration_ms', EXTRACT(EPOCH FROM (now() - v_start)) * 1000,
    'errors', v_errors,
    'timestamp', now()
  );
END;
$$;

-- Create function to get recent database logs (simplified version)
CREATE OR REPLACE FUNCTION public.get_recent_database_logs(
  log_level text DEFAULT 'error',
  limit_count int DEFAULT 50
)
RETURNS TABLE(
  log_timestamp timestamptz,
  level text,
  message text,
  context jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return recent sessions with issues as a proxy for logs
  -- This is a simplified version since direct postgres log access requires superuser
  RETURN QUERY
  SELECT 
    s.created_at as log_timestamp,
    CASE 
      WHEN s.status = 'completed' AND s.completed_questions = 0 THEN 'error'
      WHEN s.status = 'in_progress' AND s.created_at < now() - interval '24 hours' THEN 'warning'
      ELSE 'info'
    END as level,
    CASE 
      WHEN s.status = 'completed' AND s.completed_questions = 0 
        THEN 'Session completed but no responses recorded'
      WHEN s.status = 'in_progress' AND s.created_at < now() - interval '24 hours'
        THEN 'Session abandoned for > 24 hours'
      ELSE 'Session activity'
    END as message,
    jsonb_build_object(
      'session_id', s.id,
      'status', s.status,
      'completed_questions', s.completed_questions,
      'total_questions', s.total_questions,
      'email', COALESCE(s.email, 'anonymous')
    ) as context
  FROM public.assessment_sessions s
  WHERE s.created_at >= now() - interval '7 days'
    AND (
      (s.status = 'completed' AND s.completed_questions = 0)
      OR (s.status = 'in_progress' AND s.created_at < now() - interval '24 hours')
    )
  ORDER BY s.created_at DESC
  LIMIT limit_count;
END;
$$;

COMMENT ON FUNCTION public.refresh_all_materialized_views() IS 
'Refreshes all analytics materialized views. Returns summary of refresh operation including any errors.';

COMMENT ON FUNCTION public.get_recent_database_logs(text, int) IS 
'Returns proxy logs showing recent database issues like completed sessions with no data or abandoned sessions.';