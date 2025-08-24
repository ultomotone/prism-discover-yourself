-- Phase 5: Uniformity Upgrade Pack - Global Config & DB Guardrails

-- 1.1 Standardized config keys (single source of truth)
INSERT INTO scoring_config (key, value) VALUES 
  ('results_version', '"v1.1.2"'::jsonb),
  ('softmax_temp', '1.0'::jsonb),
  ('fc_expected_min', '24'::jsonb),
  ('dim_thresholds', '{"one": 2.1, "two": 3.0, "three": 3.8}'::jsonb),
  ('conf_raw_params', '{"a": 0.25, "b": 0.35, "c": 0.20}'::jsonb),
  ('conf_band_cuts', '{"high": 0.75, "moderate": 0.55}'::jsonb),
  ('neuro_norms', '{"mean": 3, "sd": 1}'::jsonb),
  ('required_question_tags', '["Ti_S","Te_S","Fi_S","Fe_S","Ni_S","Ne_S","Si_S","Se_S","N","N_R","SD","INC_A","INC_B","AC_1"]'::jsonb),
  ('system_status', '{"status": "ok", "message": "PRISM online", "last_updated": null, "updated_by": "admin"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- 1.2 DB guardrails (prevent future drift)
-- No duplicate answers per session/question
ALTER TABLE assessment_responses 
ADD CONSTRAINT IF NOT EXISTS uq_session_question UNIQUE (session_id, question_id);

-- Default timestamps for sessions
ALTER TABLE assessment_sessions 
ALTER COLUMN started_at SET DEFAULT now();

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_responses_session_q ON assessment_responses (session_id, question_id);
CREATE INDEX IF NOT EXISTS idx_profiles_session ON profiles (session_id);
CREATE INDEX IF NOT EXISTS idx_scoring_config_key ON scoring_config (key);

-- JSONB GIN for calibration model lookups
CREATE INDEX IF NOT EXISTS idx_cal_model_stratum ON calibration_model USING gin (stratum jsonb_path_ops);