-- One-time cleanup: keep latest per (session_id, question_id)
WITH ranked AS (
  SELECT id, session_id, question_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY session_id, question_id ORDER BY created_at DESC, id DESC) AS rn
  FROM public.assessment_responses
)
DELETE FROM public.assessment_responses
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Prevent new duplicates
ALTER TABLE public.assessment_responses
  ADD CONSTRAINT uniq_session_question UNIQUE (session_id, question_id);

-- Helpful index for the scorer
CREATE INDEX IF NOT EXISTS idx_assessment_responses_session ON public.assessment_responses(session_id);