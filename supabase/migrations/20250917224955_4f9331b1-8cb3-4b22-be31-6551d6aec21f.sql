-- Add results_hash and utilities for auto-finalize system (fixed digest function)

-- 1. profiles.responses_hash to guard "overwrite only if responses unchanged"
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS responses_hash text;

CREATE INDEX IF NOT EXISTS idx_profiles_session_id ON public.profiles(session_id);
CREATE INDEX IF NOT EXISTS idx_profiles_responses_hash ON public.profiles(responses_hash);

-- 2. Ensure sessions have share_token for result links
ALTER TABLE public.assessment_sessions
ADD COLUMN IF NOT EXISTS share_token uuid;

UPDATE public.assessment_sessions
SET share_token = gen_random_uuid()
WHERE share_token IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_share_token ON public.assessment_sessions(share_token);

-- 3. Helper: stable hash over a session's answers (ordered, dedup latest by question)
-- Using md5 instead of pgcrypto digest for compatibility
CREATE OR REPLACE FUNCTION public.compute_session_responses_hash(p_session uuid)
RETURNS text
LANGUAGE sql
STABLE
SET search_path TO ''
AS $$
WITH ranked AS (
  SELECT r.question_id,
         r.answer_value,
         r.answer_numeric,
         r.updated_at,
         ROW_NUMBER() OVER (
           PARTITION BY r.question_id
           ORDER BY COALESCE(r.updated_at, r.created_at) DESC
         ) AS rn
  FROM public.assessment_responses r
  WHERE r.session_id = p_session
),
dedup AS (
  SELECT question_id,
         COALESCE(answer_value, CAST(answer_numeric AS text)) AS val
  FROM ranked WHERE rn = 1
),
canon AS (
  SELECT string_agg(question_id::text || '=' || val, '|' ORDER BY question_id) AS payload
  FROM dedup
)
SELECT md5(COALESCE(payload,'')) FROM canon;
$$;

-- 4. Helper: results URL builder (uses DB setting or fallback)
CREATE OR REPLACE FUNCTION public.get_results_url(p_session uuid)
RETURNS text
LANGUAGE sql
STABLE
SET search_path TO ''
AS $$
SELECT COALESCE(
  NULLIF(current_setting('app.results_base_url', true), ''),
  'https://prispersonality.com'
) || '/results/' || p_session::text || '?t=' ||
(SELECT share_token::text FROM public.assessment_sessions s WHERE s.id = p_session);
$$;

-- 5. Dashboard RPC: strictly tied to caller's email (must match auth.users.email)
CREATE OR REPLACE FUNCTION public.get_dashboard_results_by_email(p_email text)
RETURNS TABLE(
  session_id uuid,
  type_code text,
  conf_band text,
  score_fit_calibrated numeric,
  results_url text,
  submitted_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  /* Require the caller to be logged in AND own this email */
  SELECT p.session_id,
         p.type_code,
         p.conf_band,
         p.score_fit_calibrated,
         public.get_results_url(p.session_id) AS results_url,
         COALESCE(p.recomputed_at, p.submitted_at) AS submitted_at
  FROM public.profiles p
  JOIN public.assessment_sessions s ON s.id = p.session_id
  JOIN auth.users u ON u.id = auth.uid() AND lower(u.email) = lower(p_email)
  WHERE s.completed_questions >= 248
    AND s.email IS NOT NULL
    AND s.email <> ''          -- email provided
  ORDER BY submitted_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_results_by_email(text) TO authenticated;