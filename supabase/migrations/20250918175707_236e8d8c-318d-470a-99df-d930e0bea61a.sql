-- Fix RLS policies, admin access, and config alignment
-- Migration: 2025-09-18_fix-rls-and-admin.sql

BEGIN;

-- 1) FIX PROFILES RLS POLICIES
-- Enable RLS and create service-role policy for Edge Functions
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "profiles_service" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_read" ON public.profiles;
DROP POLICY IF EXISTS "svc_manage_profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Service-role policy: allow all actions from Edge Functions
CREATE POLICY "profiles_service_role" ON public.profiles
FOR ALL TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Optional: authenticated users can read their own profiles via user_id
CREATE POLICY "profiles_owner_read" ON public.profiles
FOR SELECT TO authenticated
USING (user_id IS NOT NULL AND user_id = auth.uid());

-- 2) FIX ASSESSMENT_SESSIONS RLS
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;

-- Keep existing policies but ensure they're clean
DROP POLICY IF EXISTS "sessions_owner_read" ON public.assessment_sessions;
CREATE POLICY "sessions_owner_read" ON public.assessment_sessions
FOR SELECT TO authenticated 
USING (user_id = auth.uid());

-- 3) SECURE RPC FUNCTIONS
-- Ensure get_profile_by_session is properly secured
REVOKE ALL ON FUNCTION public.get_profile_by_session(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_profile_by_session(uuid, text) TO anon, authenticated;

-- Ensure get_recent_assessments_safe is properly secured
REVOKE ALL ON FUNCTION public.get_recent_assessments_safe() FROM public;
GRANT EXECUTE ON FUNCTION public.get_recent_assessments_safe() TO anon, authenticated;

-- 4) UPDATE SCORING CONFIG VERSION
INSERT INTO public.scoring_config (key, value)
VALUES ('results_version', '"v1.2.1"'::jsonb)
ON CONFLICT (key) 
DO UPDATE SET 
  value = '"v1.2.1"'::jsonb,
  updated_at = now()
WHERE scoring_config.value IS DISTINCT FROM '"v1.2.1"'::jsonb;

-- 5) CREATE ADMIN SUMMARY RPC FOR DASHBOARD
CREATE OR REPLACE FUNCTION public.admin_get_summary(last_n_days int DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  cutoff_date timestamp with time zone;
BEGIN
  cutoff_date := now() - (last_n_days || ' days')::interval;
  
  -- Build comprehensive summary
  WITH stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE s.status = 'completed') as total_completed,
      COUNT(*) as total_started,
      ROUND(
        (COUNT(*) FILTER (WHERE s.status = 'completed')::float / 
         NULLIF(COUNT(*), 0) * 100)::numeric, 1
      ) as completion_rate,
      ROUND(
        EXTRACT(EPOCH FROM 
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY s.completed_at - s.started_at)
        ) / 60::numeric, 1
      ) as median_duration_min,
      ROUND(
        (COUNT(*) FILTER (WHERE p.validity_status = 'pass')::float / 
         NULLIF(COUNT(*) FILTER (WHERE p.id IS NOT NULL), 0) * 100)::numeric, 1
      ) as validity_pass_rate,
      ROUND(
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.top_gap)::numeric, 1
      ) as top_gap_median,
      ROUND(
        (COUNT(*) FILTER (WHERE p.top_gap < 3)::float / 
         NULLIF(COUNT(*) FILTER (WHERE p.id IS NOT NULL), 0) * 100)::numeric, 1
      ) as close_calls_pct,
      ROUND(
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.conf_calibrated)::numeric * 100, 1
      ) as confidence_margin_median,
      ROUND(
        (COUNT(*) FILTER (WHERE 
          EXTRACT(EPOCH FROM (s.completed_at - s.started_at)) < 12 * 60
        )::float / NULLIF(COUNT(*) FILTER (WHERE s.status = 'completed'), 0) * 100)::numeric, 1
      ) as speeders_pct,
      ROUND(
        (COUNT(*) FILTER (WHERE 
          EXTRACT(EPOCH FROM (s.completed_at - s.started_at)) > 60 * 60
        )::float / NULLIF(COUNT(*) FILTER (WHERE s.status = 'completed'), 0) * 100)::numeric, 1
      ) as stallers_pct
    FROM public.assessment_sessions s
    LEFT JOIN public.profiles p ON p.session_id = s.id
    WHERE s.created_at >= cutoff_date
  ),
  duplicates AS (
    SELECT 
      ROUND(
        (COUNT(*) FILTER (WHERE dup_count > 1)::float / 
         NULLIF(COUNT(*), 0) * 100)::numeric, 1
      ) as duplicates_pct
    FROM (
      SELECT user_id, COUNT(*) as dup_count
      FROM public.assessment_sessions s
      WHERE s.created_at >= cutoff_date 
      AND s.user_id IS NOT NULL
      GROUP BY user_id
    ) dup_stats
  )
  SELECT jsonb_build_object(
    'total_completed', s.total_completed,
    'total_started', s.total_started,
    'completion_rate', s.completion_rate,
    'median_duration_min', s.median_duration_min,
    'validity_pass_rate', s.validity_pass_rate,
    'top_gap_median', s.top_gap_median,
    'close_calls_pct', s.close_calls_pct,
    'confidence_margin_median', s.confidence_margin_median,
    'speeders_pct', s.speeders_pct,
    'stallers_pct', s.stallers_pct,
    'duplicates_pct', d.duplicates_pct,
    'generated_at', now()
  ) INTO result
  FROM stats s, duplicates d;
  
  RETURN result;
END;
$$;

-- Grant access to admin summary function
REVOKE ALL ON FUNCTION public.admin_get_summary(int) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_get_summary(int) TO anon, authenticated;

COMMIT;