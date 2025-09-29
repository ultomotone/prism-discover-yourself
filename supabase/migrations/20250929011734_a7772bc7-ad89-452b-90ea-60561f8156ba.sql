-- Add normalized response columns (Option A - audit trail approach)
ALTER TABLE public.assessment_responses
  ADD COLUMN IF NOT EXISTS normalized_value numeric,
  ADD COLUMN IF NOT EXISTS reverse_applied boolean,
  ADD COLUMN IF NOT EXISTS normalize_version text,
  ADD COLUMN IF NOT EXISTS normalized_at timestamptz;

-- Create view to track answer counts per session
CREATE OR REPLACE VIEW public.v_session_answer_counts AS
SELECT session_id, count(*)::int as answer_count
FROM public.assessment_responses
GROUP BY session_id;

-- Create view to identify sessions that need recompute
CREATE OR REPLACE VIEW public.v_sessions_for_recompute AS
SELECT s.id as session_id, s.created_at as session_created_at
FROM public.assessment_sessions s
LEFT JOIN public.v_session_answer_counts c ON c.session_id = s.id
LEFT JOIN public.scoring_results r ON r.session_id = s.id
WHERE COALESCE(c.answer_count,0) >= 148
  AND (r.session_id IS NULL OR r.scoring_version <> (SELECT value #>> '{}' FROM public.scoring_config WHERE key = 'results_version' LIMIT 1));

-- Create view for normalized responses (hybrid approach - can use stored or compute on-the-fly)
CREATE OR REPLACE VIEW public.v_normalized_responses AS
SELECT
  r.session_id,
  r.question_id,
  r.answer_value as raw_value,
  r.answer_numeric,
  CASE 
    WHEN r.normalized_value IS NOT NULL THEN r.normalized_value
    ELSE CASE
      WHEN sk.scale_type = 'LIKERT_1_5' AND r.answer_numeric IS NOT NULL
        THEN (CASE WHEN sk.reverse_scored THEN 6 - r.answer_numeric ELSE r.answer_numeric END)
      WHEN sk.scale_type = 'LIKERT_1_7' AND r.answer_numeric IS NOT NULL
        THEN (CASE WHEN sk.reverse_scored THEN 8 - r.answer_numeric ELSE r.answer_numeric END)
      ELSE r.answer_numeric
    END
  END::numeric as normalized_value,
  COALESCE(r.reverse_applied, sk.reverse_scored, false) as reverse_applied,
  sk.scale_type,
  sk.weight
FROM public.assessment_responses r
LEFT JOIN public.assessment_scoring_key sk ON sk.question_id = r.question_id;