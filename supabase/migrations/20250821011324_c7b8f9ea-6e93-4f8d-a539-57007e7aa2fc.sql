-- Backup columns for original timestamps (if not present)
ALTER TABLE public.assessment_sessions
  ADD COLUMN IF NOT EXISTS started_at_original timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at_original timestamptz,
  ADD COLUMN IF NOT EXISTS created_at_original timestamptz;

-- Overwrite timestamps for sessions created between Aug 18–21 (inclusive),
-- using inferred_session_times (response_time_ms preferred, else created_at fallbacks).
-- Preserve existing values only if they already match inferred values.
WITH targets AS (
  SELECT 
    s.id,
    COALESCE(ist.started_at_inferred_ms, ist.started_at_created_at) AS inferred_started,
    COALESCE(ist.completed_at_inferred_ms, ist.completed_at_created_at) AS inferred_completed,
    LEAST(
      COALESCE(ist.started_at_inferred_ms, ist.started_at_created_at, s.created_at),
      COALESCE(p.created_at, s.created_at)
    ) AS inferred_created
  FROM public.assessment_sessions s
  JOIN public.inferred_session_times ist ON ist.session_id = s.id
  LEFT JOIN public.profiles p ON p.session_id = s.id
  WHERE s.created_at::date BETWEEN DATE '2025-08-18' AND DATE '2025-08-21'
)
UPDATE public.assessment_sessions AS s
SET 
  -- Backup existing values once when differing from inferred
  started_at_original = CASE 
    WHEN s.started_at_original IS NULL AND s.started_at IS DISTINCT FROM t.inferred_started THEN s.started_at
    ELSE s.started_at_original
  END,
  completed_at_original = CASE 
    WHEN s.completed_at_original IS NULL AND s.completed_at IS DISTINCT FROM t.inferred_completed THEN s.completed_at
    ELSE s.completed_at_original
  END,
  created_at_original = CASE 
    WHEN s.created_at_original IS NULL AND s.created_at IS DISTINCT FROM t.inferred_created THEN s.created_at
    ELSE s.created_at_original
  END,
  -- Overwrite with inferred values
  started_at = COALESCE(t.inferred_started, s.started_at),
  completed_at = COALESCE(t.inferred_completed, s.completed_at),
  created_at = COALESCE(t.inferred_created, s.created_at),
  updated_at = now()
FROM targets t
WHERE s.id = t.id
  AND (
    s.started_at IS DISTINCT FROM t.inferred_started OR
    s.completed_at IS DISTINCT FROM t.inferred_completed OR
    s.created_at IS DISTINCT FROM t.inferred_created
  );