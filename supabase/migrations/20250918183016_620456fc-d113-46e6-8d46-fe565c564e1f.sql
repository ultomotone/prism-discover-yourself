-- Fix admin_get_summary function with correct formulas and proper joins

CREATE OR REPLACE FUNCTION public.admin_get_summary(last_n_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  cutoff_date timestamp with time zone;
BEGIN
  cutoff_date := now() - (last_n_days || ' days')::interval;
  
  WITH 
  -- Sessions started in window (for completion rate denominator)
  started_sessions AS (
    SELECT id, started_at, completed_at, status, email, user_id
    FROM public.assessment_sessions 
    WHERE started_at >= cutoff_date
  ),
  -- Sessions completed in window  
  completed_sessions AS (
    SELECT id, started_at, completed_at, status, email, user_id
    FROM public.assessment_sessions 
    WHERE status = 'completed' 
    AND completed_at >= cutoff_date
  ),
  -- Profiles for completed sessions only
  session_profiles AS (
    SELECT 
      p.session_id,
      p.type_code,
      p.top_gap,
      p.score_fit_calibrated,
      p.conf_calibrated,
      p.validity_status,
      p.overlay,
      s.started_at,
      s.completed_at,
      s.email,
      s.user_id
    FROM public.profiles p
    JOIN completed_sessions s ON s.id = p.session_id
  ),
  -- Duration calculations (properly bounded)
  durations AS (
    SELECT 
      session_id,
      CASE 
        WHEN started_at IS NOT NULL AND completed_at IS NOT NULL
        THEN GREATEST(1, LEAST(180, 
          EXTRACT(EPOCH FROM (completed_at - started_at)) / 60.0
        ))
        ELSE NULL
      END as duration_min
    FROM session_profiles
  ),
  -- Duplicate detection by email/user_id
  duplicates AS (
    SELECT 
      COALESCE(user_id::text, LOWER(email), 'anonymous') as identifier,
      COUNT(*) as session_count
    FROM completed_sessions
    WHERE email IS NOT NULL OR user_id IS NOT NULL
    GROUP BY COALESCE(user_id::text, LOWER(email), 'anonymous')
  ),
  -- Main metrics calculation
  metrics AS (
    SELECT 
      -- Totals
      (SELECT COUNT(*) FROM started_sessions) as total_started,
      (SELECT COUNT(*) FROM completed_sessions) as total_completed,
      (SELECT COUNT(*) FROM session_profiles) as profiles_created,
      
      -- Completion rate
      ROUND(
        (SELECT COUNT(*)::float FROM completed_sessions) / 
        NULLIF((SELECT COUNT(*) FROM started_sessions), 0) * 100, 1
      ) as completion_rate,
      
      -- Duration metrics (from valid durations only)
      ROUND(
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_min), 1
      ) as median_duration_min,
      ROUND(
        (COUNT(*) FILTER (WHERE duration_min > 60)::float / 
         NULLIF(COUNT(*) FILTER (WHERE duration_min IS NOT NULL), 0) * 100), 1
      ) as stallers_pct,
      ROUND(
        (COUNT(*) FILTER (WHERE duration_min < 12)::float / 
         NULLIF(COUNT(*) FILTER (WHERE duration_min IS NOT NULL), 0) * 100), 1
      ) as speeders_pct,
      
      -- Validity
      ROUND(
        (COUNT(*) FILTER (WHERE sp.validity_status = 'pass')::float / 
         NULLIF(COUNT(*), 0) * 100), 1
      ) as validity_pass_rate,
      
      -- Fit metrics
      ROUND(
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sp.top_gap), 1
      ) as top_gap_median,
      ROUND(
        (COUNT(*) FILTER (WHERE sp.top_gap < 3)::float / 
         NULLIF(COUNT(*) FILTER (WHERE sp.top_gap IS NOT NULL), 0) * 100), 1
      ) as close_calls_pct,
      
      -- Confidence (calibrated, as percentage)
      ROUND(
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sp.conf_calibrated) * 100, 1
      ) as confidence_margin_median
      
    FROM session_profiles sp
    LEFT JOIN durations d ON d.session_id = sp.session_id
  ),
  -- Duplicates calculation
  dup_stats AS (
    SELECT 
      ROUND(
        (COUNT(*) FILTER (WHERE session_count > 1)::float / 
         NULLIF(COUNT(*), 0) * 100), 1
      ) as duplicates_pct
    FROM duplicates
  )
  
  SELECT jsonb_build_object(
    'total_started', m.total_started,
    'total_completed', m.total_completed,
    'completion_rate', m.completion_rate,
    'median_duration_min', m.median_duration_min,
    'stallers_pct', m.stallers_pct,
    'speeders_pct', m.speeders_pct,
    'validity_pass_rate', m.validity_pass_rate,
    'top_gap_median', m.top_gap_median,
    'close_calls_pct', m.close_calls_pct,
    'confidence_margin_median', m.confidence_margin_median,
    'duplicates_pct', ds.duplicates_pct,
    'generated_at', now()
  ) INTO result
  FROM metrics m, dup_stats ds;
  
  RETURN result;
END;
$function$;