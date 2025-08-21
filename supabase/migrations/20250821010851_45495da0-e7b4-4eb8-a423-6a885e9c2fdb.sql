-- 1) Create or replace helper view with inferred timestamps from responses
CREATE OR REPLACE VIEW public.inferred_session_times AS
SELECT
  ar.session_id,
  -- Prefer response_time_ms if present; otherwise keep NULL here and rely on created_at fallback
  CASE WHEN MIN(ar.response_time_ms) IS NOT NULL 
       THEN to_timestamp(MIN(ar.response_time_ms)::double precision / 1000.0)::timestamptz 
  END AS started_at_inferred_ms,
  CASE WHEN MAX(ar.response_time_ms) IS NOT NULL 
       THEN to_timestamp(MAX(ar.response_time_ms)::double precision / 1000.0)::timestamptz 
  END AS completed_at_inferred_ms,
  -- Fallbacks based on row created_at
  MIN(ar.created_at) AS started_at_created_at,
  MAX(ar.created_at) AS completed_at_created_at
FROM public.assessment_responses ar
GROUP BY ar.session_id;

-- 2) Patch only likely corrupted or missing timings in assessment_sessions
UPDATE public.assessment_sessions AS s
SET 
  started_at = COALESCE(ist.started_at_inferred_ms, ist.started_at_created_at, s.started_at),
  completed_at = COALESCE(ist.completed_at_inferred_ms, ist.completed_at_created_at, s.completed_at),
  created_at = LEAST(
    COALESCE(ist.started_at_inferred_ms, ist.started_at_created_at, s.created_at),
    COALESCE(p.created_at, s.created_at)
  ),
  updated_at = now()
FROM public.inferred_session_times ist
LEFT JOIN public.profiles p ON p.session_id = ist.session_id
WHERE s.id = ist.session_id
  AND (
    s.completed_at IS NULL OR s.started_at IS NULL OR
    (s.completed_at - s.started_at) < INTERVAL '60 seconds'
  );