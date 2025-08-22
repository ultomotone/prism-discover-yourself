-- Fix grouping expression in stats function and run backfill
CREATE OR REPLACE FUNCTION public.update_dashboard_statistics_for_date(target_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  DELETE FROM public.dashboard_statistics WHERE stat_date = target_date;

  INSERT INTO public.dashboard_statistics (
    stat_date,
    total_assessments,
    daily_assessments,
    overlay_positive,
    overlay_negative,
    type_distribution
  )
  WITH completed_sessions AS (
    SELECT s.id, s.completed_at, p.type_code, p.overlay
    FROM public.assessment_sessions s
    JOIN public.profiles p ON p.session_id = s.id
    WHERE s.status = 'completed' AND s.completed_at IS NOT NULL
  ),
  today_completed AS (
    SELECT * FROM completed_sessions WHERE DATE(completed_at) = target_date
  ),
  all_completed AS (
    SELECT * FROM completed_sessions
  )
  SELECT 
    target_date AS stat_date,
    (SELECT COUNT(*) FROM all_completed) AS total_assessments,
    (SELECT COUNT(*) FROM today_completed) AS daily_assessments,
    (SELECT COUNT(*) FROM today_completed WHERE overlay = '+') AS overlay_positive,
    (SELECT COUNT(*) FROM today_completed WHERE overlay = '–') AS overlay_negative,
    (
      SELECT COALESCE(jsonb_object_agg(type_prefix, type_count), '{}'::jsonb)
      FROM (
        SELECT LEFT(COALESCE(type_code, ''), 3) AS type_prefix, COUNT(*) AS type_count
        FROM today_completed
        WHERE type_code IS NOT NULL
        GROUP BY LEFT(COALESCE(type_code, ''), 3)
      ) t
    ) AS type_distribution;
END;
$$;

-- Run backfill again now that the function is fixed
SELECT public.update_dashboard_statistics_range(
  (SELECT COALESCE(MIN(DATE(completed_at)), CURRENT_DATE) FROM public.assessment_sessions WHERE status = 'completed'),
  CURRENT_DATE
);
