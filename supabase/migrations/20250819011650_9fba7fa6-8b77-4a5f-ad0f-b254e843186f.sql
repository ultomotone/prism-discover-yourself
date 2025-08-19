-- 1) One-time cleanup: keep latest per (session_id, question_id)
WITH ranked AS (
  SELECT id, session_id, question_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY session_id, question_id ORDER BY created_at DESC, id DESC) AS rn
  FROM public.assessment_responses
)
DELETE FROM public.assessment_responses
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 2) Prevent future duplicates (safe if-not-exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uniq_session_question'
  ) THEN
    ALTER TABLE public.assessment_responses
      ADD CONSTRAINT uniq_session_question UNIQUE (session_id, question_id);
  END IF;
END$$;

-- 3) Helpful index
CREATE INDEX IF NOT EXISTS idx_assessment_responses_session ON public.assessment_responses(session_id);

-- 4) Update norms & state config on 1..5 scale
INSERT INTO public.scoring_config(key, value) VALUES
  ('neuro_norms', '{"mean":3.0,"sd":0.8}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.scoring_config(key, value) VALUES
  ('state_qids', '{"stress":201,"mood":202,"sleep":203,"time":204,"focus":205}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
