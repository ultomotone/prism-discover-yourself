-- Recover accurate timestamps for assessment_sessions based on assessment_responses
-- Criteria: only sessions where (completed_at - started_at) < 60 seconds
-- Using assessment_responses.created_at as the event timestamps (no response_time column exists)
-- created_at will be set to the earlier of MIN(response.created_at) and profiles.created_at

-- 1) Build response min/max per session
WITH resp AS (
  SELECT session_id,
         MIN(created_at) AS min_ts,
         MAX(created_at) AS max_ts
  FROM public.assessment_responses
  GROUP BY session_id
),
-- 2) Candidate sessions likely corrupted
cand AS (
  SELECT s.id AS session_id,
         s.started_at,
         s.completed_at,
         s.created_at AS sess_created_at,
         r.min_ts,
         r.max_ts,
         p.created_at AS profile_created_at
  FROM public.assessment_sessions s
  JOIN resp r ON r.session_id = s.id
  LEFT JOIN public.profiles p ON p.session_id = s.id
  WHERE s.started_at IS NOT NULL
    AND s.completed_at IS NOT NULL
    AND (s.completed_at - s.started_at) < INTERVAL '60 seconds'
)
-- 3) Update sessions in one pass
UPDATE public.assessment_sessions AS s
SET 
  started_at = COALESCE(c.min_ts, s.started_at),
  completed_at = COALESCE(c.max_ts, s.completed_at),
  created_at = LEAST(COALESCE(c.min_ts, s.created_at), COALESCE(c.profile_created_at, s.created_at)),
  updated_at = now()
FROM cand c
WHERE s.id = c.session_id;