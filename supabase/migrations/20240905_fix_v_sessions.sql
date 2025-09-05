-- Adjust schema/table names if yours differ (public.*, assessment_*)

DROP VIEW IF EXISTS public.v_sessions CASCADE;

CREATE OR REPLACE VIEW public.v_sessions AS
SELECT
  s.id                                   AS session_id,
  s.user_id                              AS user_id,          -- ✅ source from sessions
  s.started_at                           AS started_at,
  s.completed_at                         AS completed_at,
  s.status                               AS status,
  /* Duration in whole seconds; if not completed, measure until now; guards against negative durations */
  CASE
    WHEN s.started_at IS NOT NULL THEN
      GREATEST(EXTRACT(EPOCH FROM COALESCE(s.completed_at, NOW()) - s.started_at), 0)::bigint
  END                                   AS duration_seconds,
  /* Completion flag: completed_at present or status matches finalized states */
  (
    s.completed_at IS NOT NULL
    OR LOWER(COALESCE(s.status, '')) IN ('completed', 'complete', 'finalized', 'scored')
  )                                      AS is_completed,
  /* Optional result linkage */
  r.id                                   AS result_id,
  r.created_at                           AS result_created_at
FROM public.assessment_sessions AS s
LEFT JOIN public.assessment_results AS r
  ON r.session_id = s.id;

COMMENT ON VIEW public.v_sessions IS
  'Sessions with optional linked results; includes duration and completion flag.';

-- Optional: adjust these to your access model
GRANT SELECT ON public.v_sessions TO anon, authenticated;
