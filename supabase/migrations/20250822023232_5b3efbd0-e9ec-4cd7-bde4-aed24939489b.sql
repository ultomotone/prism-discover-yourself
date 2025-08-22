-- Recompute dashboard statistics using session completion dates and support historical backfill

-- 1) Function to compute stats for a specific date
CREATE OR REPLACE FUNCTION public.update_dashboard_statistics_for_date(target_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Replace the row for the given date
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
        GROUP BY LEFT(type_code, 3)
      ) t
    ) AS type_distribution;
END;
$$;

-- 2) Keep existing zero-arg function for UI compatibility (updates today)
CREATE OR REPLACE FUNCTION public.update_dashboard_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  PERFORM public.update_dashboard_statistics_for_date(CURRENT_DATE);
END;
$$;

-- 3) Function to backfill a date range
CREATE OR REPLACE FUNCTION public.update_dashboard_statistics_range(start_date date, end_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  d date;
BEGIN
  IF start_date IS NULL THEN
    SELECT COALESCE(MIN(DATE(completed_at)), CURRENT_DATE) INTO start_date FROM public.assessment_sessions WHERE status = 'completed';
  END IF;
  IF end_date IS NULL THEN
    end_date := CURRENT_DATE;
  END IF;

  d := start_date;
  WHILE d <= end_date LOOP
    PERFORM public.update_dashboard_statistics_for_date(d);
    d := d + INTERVAL '1 day';
  END LOOP;
END;
$$;

-- 4) Trigger to update stats when a profile is created (uses the session's completed_at date)
CREATE OR REPLACE FUNCTION public.on_profile_insert_update_dashboard_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  comp_date date;
BEGIN
  SELECT DATE(s.completed_at) INTO comp_date
  FROM public.assessment_sessions s
  WHERE s.id = NEW.session_id;

  IF comp_date IS NULL THEN
    comp_date := CURRENT_DATE;
  END IF;

  PERFORM public.update_dashboard_statistics_for_date(comp_date);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_update_dashboard_stats ON public.profiles;
CREATE TRIGGER trg_profile_update_dashboard_stats
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.on_profile_insert_update_dashboard_stats();

-- 5) One-time historical backfill
SELECT public.update_dashboard_statistics_range(
  (SELECT COALESCE(MIN(DATE(completed_at)), CURRENT_DATE) FROM public.assessment_sessions WHERE status = 'completed'),
  CURRENT_DATE
);
