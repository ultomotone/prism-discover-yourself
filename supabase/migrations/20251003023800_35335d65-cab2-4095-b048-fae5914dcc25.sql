-- Post-Survey System Schema (psv1.0)
-- Creates versioned post-survey infrastructure with 21 items across 5 scales

-- 1. Version tracking
CREATE TABLE IF NOT EXISTS public.post_survey_versions (
  version TEXT PRIMARY KEY,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Survey questions (21 items)
CREATE TABLE IF NOT EXISTS public.post_survey_questions (
  id BIGSERIAL PRIMARY KEY,
  version TEXT NOT NULL REFERENCES post_survey_versions(version),
  item_code TEXT NOT NULL,
  item_text TEXT NOT NULL,
  response_type TEXT NOT NULL CHECK (response_type IN ('LIKERT_5', 'NPS_0_10', 'TEXT', 'BOOLEAN')),
  position INTEGER NOT NULL,
  reverse_scored BOOLEAN DEFAULT false,
  required BOOLEAN DEFAULT true,
  UNIQUE(version, item_code),
  UNIQUE(version, position)
);

-- 3. Scale definitions
CREATE TABLE IF NOT EXISTS public.post_survey_scales (
  id BIGSERIAL PRIMARY KEY,
  version TEXT NOT NULL REFERENCES post_survey_versions(version),
  scale_code TEXT NOT NULL,
  scale_name TEXT NOT NULL,
  description TEXT,
  target_min INTEGER,
  target_good INTEGER,
  UNIQUE(version, scale_code)
);

-- 4. Item-to-scale mapping
CREATE TABLE IF NOT EXISTS public.post_survey_scale_items (
  id BIGSERIAL PRIMARY KEY,
  version TEXT NOT NULL,
  scale_code TEXT NOT NULL,
  item_code TEXT NOT NULL,
  FOREIGN KEY (version, scale_code) REFERENCES post_survey_scales(version, scale_code),
  FOREIGN KEY (version, item_code) REFERENCES post_survey_questions(version, item_code),
  UNIQUE(version, item_code, scale_code)
);

-- 5. Survey sessions
CREATE TABLE IF NOT EXISTS public.post_survey_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_session_id UUID NOT NULL REFERENCES assessment_sessions(id),
  version TEXT NOT NULL REFERENCES post_survey_versions(version),
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(assessment_session_id)
);

-- 6. Individual responses
CREATE TABLE IF NOT EXISTS public.post_survey_responses (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES post_survey_sessions(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  value_numeric INTEGER,
  value_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, item_code)
);

-- 7. Computed scores
CREATE TABLE IF NOT EXISTS public.post_survey_scores (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES post_survey_sessions(id) ON DELETE CASCADE,
  clarity_idx NUMERIC(5,2),
  engagement_idx NUMERIC(5,2),
  accuracy_idx NUMERIC(5,2),
  insight_idx NUMERIC(5,2),
  trust_idx NUMERIC(5,2),
  nps_score NUMERIC(5,2),
  wtp_idx NUMERIC(5,2),
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id)
);

-- Seed version psv1.0
INSERT INTO public.post_survey_versions (version, description, active) 
VALUES ('psv1.0', 'Initial post-survey version with 21 items', true)
ON CONFLICT (version) DO NOTHING;

-- Seed all 21 questions
INSERT INTO public.post_survey_questions (version, item_code, item_text, response_type, position, reverse_scored, required) VALUES
('psv1.0', 'C1', 'The questions felt clear and unambiguous.', 'LIKERT_5', 1, false, true),
('psv1.0', 'C2', 'The results were explained in language I understand.', 'LIKERT_5', 2, false, true),
('psv1.0', 'C3', 'I had to reread parts of the report to grasp the meaning.', 'LIKERT_5', 3, true, true),
('psv1.0', 'E1', 'It was easy to stay focused while taking the assessment.', 'LIKERT_5', 4, false, true),
('psv1.0', 'E2', 'The length of the assessment felt reasonable.', 'LIKERT_5', 5, false, true),
('psv1.0', 'E3', 'I felt mentally fatigued while answering.', 'LIKERT_5', 6, true, true),
('psv1.0', 'A1', 'The results accurately described how I think and behave.', 'LIKERT_5', 7, false, true),
('psv1.0', 'A2', 'The top type/function profile fit me well.', 'LIKERT_5', 8, false, true),
('psv1.0', 'A3', 'The results missed important aspects of me.', 'LIKERT_5', 9, true, true),
('psv1.0', 'I1', 'The report gave me new insights about myself.', 'LIKERT_5', 10, false, true),
('psv1.0', 'I2', 'I learned something valuable from the results.', 'LIKERT_5', 11, false, true),
('psv1.0', 'I3', 'The insights felt generic or could apply to anyone.', 'LIKERT_5', 12, true, true),
('psv1.0', 'T1', 'I trust the science behind this assessment.', 'LIKERT_5', 13, false, true),
('psv1.0', 'T2', 'The results feel credible and well-researched.', 'LIKERT_5', 14, false, true),
('psv1.0', 'T3', 'I doubt the validity of the methodology.', 'LIKERT_5', 15, true, true),
('psv1.0', 'NPS', 'How likely are you to recommend PRISM to a friend or colleague?', 'NPS_0_10', 16, false, true),
('psv1.0', 'WTP', 'I would be willing to pay for this assessment.', 'LIKERT_5', 17, false, true),
('psv1.0', 'OPEN1', 'What did you find most valuable about your PRISM results?', 'TEXT', 18, false, false),
('psv1.0', 'OPEN2', 'What could we improve about PRISM?', 'TEXT', 19, false, false),
('psv1.0', 'CONSENT_RETEST', 'I consent to being contacted for a retest study.', 'BOOLEAN', 20, false, false),
('psv1.0', 'CONSENT_RESEARCH', 'I consent to my anonymized data being used for research.', 'BOOLEAN', 21, false, false)
ON CONFLICT (version, item_code) DO NOTHING;

-- Seed scales
INSERT INTO public.post_survey_scales (version, scale_code, scale_name, description, target_min, target_good) VALUES
('psv1.0', 'CLARITY', 'Question Clarity', 'How clear and understandable were the questions and results', 70, 80),
('psv1.0', 'ENGAGEMENT', 'Engagement', 'How engaging and reasonable was the assessment experience', 70, 75),
('psv1.0', 'ACCURACY', 'Accuracy', 'How well the results fit the user', 70, 75),
('psv1.0', 'INSIGHT', 'Insight', 'How insightful and valuable were the results', 70, 70),
('psv1.0', 'TRUST', 'Trust', 'How much the user trusts the assessment', 70, 75),
('psv1.0', 'NPS', 'Net Promoter Score', 'Likelihood to recommend', -100, 30),
('psv1.0', 'WTP', 'Willingness to Pay', 'Perceived value of the assessment', 60, 60)
ON CONFLICT (version, scale_code) DO NOTHING;

-- Seed scale-item mappings
INSERT INTO public.post_survey_scale_items (version, scale_code, item_code) VALUES
('psv1.0', 'CLARITY', 'C1'),
('psv1.0', 'CLARITY', 'C2'),
('psv1.0', 'CLARITY', 'C3'),
('psv1.0', 'ENGAGEMENT', 'E1'),
('psv1.0', 'ENGAGEMENT', 'E2'),
('psv1.0', 'ENGAGEMENT', 'E3'),
('psv1.0', 'ACCURACY', 'A1'),
('psv1.0', 'ACCURACY', 'A2'),
('psv1.0', 'ACCURACY', 'A3'),
('psv1.0', 'INSIGHT', 'I1'),
('psv1.0', 'INSIGHT', 'I2'),
('psv1.0', 'INSIGHT', 'I3'),
('psv1.0', 'TRUST', 'T1'),
('psv1.0', 'TRUST', 'T2'),
('psv1.0', 'TRUST', 'T3'),
('psv1.0', 'NPS', 'NPS'),
('psv1.0', 'WTP', 'WTP')
ON CONFLICT (version, item_code, scale_code) DO NOTHING;

-- Create scoring function
CREATE OR REPLACE FUNCTION public.compute_post_survey_score(p_session UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clarity NUMERIC;
  v_engagement NUMERIC;
  v_accuracy NUMERIC;
  v_insight NUMERIC;
  v_trust NUMERIC;
  v_nps NUMERIC;
  v_wtp NUMERIC;
  v_promoters INTEGER;
  v_detractors INTEGER;
  v_total_nps INTEGER;
BEGIN
  -- Compute CLARITY index (0-100)
  SELECT AVG(
    CASE 
      WHEN q.reverse_scored THEN (6 - r.value_numeric) 
      ELSE r.value_numeric 
    END
  ) * 25 - 25 INTO v_clarity
  FROM post_survey_responses r
  JOIN post_survey_questions q ON q.item_code = r.item_code AND q.version = 'psv1.0'
  JOIN post_survey_scale_items si ON si.item_code = r.item_code AND si.version = 'psv1.0'
  WHERE r.session_id = p_session AND si.scale_code = 'CLARITY' AND r.value_numeric IS NOT NULL;

  -- Compute ENGAGEMENT index (0-100)
  SELECT AVG(
    CASE 
      WHEN q.reverse_scored THEN (6 - r.value_numeric) 
      ELSE r.value_numeric 
    END
  ) * 25 - 25 INTO v_engagement
  FROM post_survey_responses r
  JOIN post_survey_questions q ON q.item_code = r.item_code AND q.version = 'psv1.0'
  JOIN post_survey_scale_items si ON si.item_code = r.item_code AND si.version = 'psv1.0'
  WHERE r.session_id = p_session AND si.scale_code = 'ENGAGEMENT' AND r.value_numeric IS NOT NULL;

  -- Compute ACCURACY index (0-100)
  SELECT AVG(
    CASE 
      WHEN q.reverse_scored THEN (6 - r.value_numeric) 
      ELSE r.value_numeric 
    END
  ) * 25 - 25 INTO v_accuracy
  FROM post_survey_responses r
  JOIN post_survey_questions q ON q.item_code = r.item_code AND q.version = 'psv1.0'
  JOIN post_survey_scale_items si ON si.item_code = r.item_code AND si.version = 'psv1.0'
  WHERE r.session_id = p_session AND si.scale_code = 'ACCURACY' AND r.value_numeric IS NOT NULL;

  -- Compute INSIGHT index (0-100)
  SELECT AVG(
    CASE 
      WHEN q.reverse_scored THEN (6 - r.value_numeric) 
      ELSE r.value_numeric 
    END
  ) * 25 - 25 INTO v_insight
  FROM post_survey_responses r
  JOIN post_survey_questions q ON q.item_code = r.item_code AND q.version = 'psv1.0'
  JOIN post_survey_scale_items si ON si.item_code = r.item_code AND si.version = 'psv1.0'
  WHERE r.session_id = p_session AND si.scale_code = 'INSIGHT' AND r.value_numeric IS NOT NULL;

  -- Compute TRUST index (0-100)
  SELECT AVG(
    CASE 
      WHEN q.reverse_scored THEN (6 - r.value_numeric) 
      ELSE r.value_numeric 
    END
  ) * 25 - 25 INTO v_trust
  FROM post_survey_responses r
  JOIN post_survey_questions q ON q.item_code = r.item_code AND q.version = 'psv1.0'
  JOIN post_survey_scale_items si ON si.item_code = r.item_code AND si.version = 'psv1.0'
  WHERE r.session_id = p_session AND si.scale_code = 'TRUST' AND r.value_numeric IS NOT NULL;

  -- Compute NPS score (-100 to +100)
  SELECT 
    COUNT(*) FILTER (WHERE value_numeric >= 9),
    COUNT(*) FILTER (WHERE value_numeric <= 6),
    COUNT(*)
  INTO v_promoters, v_detractors, v_total_nps
  FROM post_survey_responses
  WHERE session_id = p_session AND item_code = 'NPS';
  
  IF v_total_nps > 0 THEN
    v_nps := ((v_promoters::NUMERIC - v_detractors::NUMERIC) / v_total_nps::NUMERIC) * 100;
  ELSE
    v_nps := NULL;
  END IF;

  -- Compute WTP index (0-100)
  SELECT (value_numeric * 25) - 25 INTO v_wtp
  FROM post_survey_responses
  WHERE session_id = p_session AND item_code = 'WTP';

  -- Upsert scores
  INSERT INTO post_survey_scores (
    session_id, clarity_idx, engagement_idx, accuracy_idx, 
    insight_idx, trust_idx, nps_score, wtp_idx, computed_at
  ) VALUES (
    p_session, v_clarity, v_engagement, v_accuracy,
    v_insight, v_trust, v_nps, v_wtp, now()
  )
  ON CONFLICT (session_id) DO UPDATE SET
    clarity_idx = EXCLUDED.clarity_idx,
    engagement_idx = EXCLUDED.engagement_idx,
    accuracy_idx = EXCLUDED.accuracy_idx,
    insight_idx = EXCLUDED.insight_idx,
    trust_idx = EXCLUDED.trust_idx,
    nps_score = EXCLUDED.nps_score,
    wtp_idx = EXCLUDED.wtp_idx,
    computed_at = now();

  -- Mark session as completed
  UPDATE post_survey_sessions 
  SET completed_at = now() 
  WHERE id = p_session AND completed_at IS NULL;
END;
$$;

-- Create materialized view for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_post_survey AS
SELECT
  DATE(ps.completed_at) as day,
  COUNT(DISTINCT ps.id) as n_surveys,
  ROUND(AVG(pss.clarity_idx)::numeric, 1) as clarity_idx,
  ROUND(AVG(pss.engagement_idx)::numeric, 1) as engagement_idx,
  ROUND(AVG(pss.accuracy_idx)::numeric, 1) as accuracy_idx,
  ROUND(AVG(pss.insight_idx)::numeric, 1) as insight_idx,
  ROUND(AVG(pss.trust_idx)::numeric, 1) as trust_idx,
  ROUND(AVG(pss.nps_score)::numeric, 1) as nps_score,
  ROUND(AVG(pss.wtp_idx)::numeric, 1) as wtp_idx
FROM post_survey_sessions ps
JOIN post_survey_scores pss ON pss.session_id = ps.id
WHERE ps.completed_at IS NOT NULL
GROUP BY DATE(ps.completed_at);

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_post_survey_day 
ON mv_kpi_post_survey(day);

-- RLS Policies
ALTER TABLE public.post_survey_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_survey_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_survey_scale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_survey_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_survey_scores ENABLE ROW LEVEL SECURITY;

-- Public read on reference tables
CREATE POLICY "Anyone can view versions" ON post_survey_versions FOR SELECT USING (true);
CREATE POLICY "Anyone can view questions" ON post_survey_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can view scales" ON post_survey_scales FOR SELECT USING (true);
CREATE POLICY "Anyone can view scale items" ON post_survey_scale_items FOR SELECT USING (true);

-- Users read own sessions/responses/scores
CREATE POLICY "Users view own sessions" ON post_survey_sessions FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users view own responses" ON post_survey_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM post_survey_sessions WHERE id = session_id AND (auth.uid() = user_id OR user_id IS NULL))
);
CREATE POLICY "Users view own scores" ON post_survey_scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM post_survey_sessions WHERE id = session_id AND (auth.uid() = user_id OR user_id IS NULL))
);

-- Grant execute on function
GRANT EXECUTE ON FUNCTION compute_post_survey_score TO authenticated, anon, service_role;