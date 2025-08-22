-- v1.1.2 Confidence Calibration & MAI Improvements

-- 1) Calibration model table to store isotonic/Platt mapping
CREATE TABLE IF NOT EXISTS calibration_model (
  id BIGSERIAL PRIMARY KEY,
  version TEXT NOT NULL DEFAULT 'v1.1.2',
  method TEXT NOT NULL DEFAULT 'isotonic', -- 'isotonic' | 'platt'
  stratum JSONB NOT NULL,                  -- e.g. {"dim_band":"4D","overlay":"plus"}
  knots JSONB NOT NULL,                    -- [{x: raw, y: calibrated}, ...]
  trained_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for calibration_model
ALTER TABLE calibration_model ENABLE ROW LEVEL SECURITY;

-- Allow public read access for dashboard
CREATE POLICY "Calibration model is publicly readable" 
ON calibration_model 
FOR SELECT 
USING (true);

-- Service role can manage calibration model
CREATE POLICY "Service role can manage calibration model" 
ON calibration_model 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- 2) Session method metrics for MAI computation
CREATE TABLE IF NOT EXISTS session_method_metrics (
  session_id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  likert_z JSONB NOT NULL,
  fc_z JSONB NOT NULL
);

-- Enable RLS for session_method_metrics
ALTER TABLE session_method_metrics ENABLE ROW LEVEL SECURITY;

-- Allow public read access for dashboard analytics
CREATE POLICY "Method metrics are publicly readable" 
ON session_method_metrics 
FOR SELECT 
USING (true);

-- Service role can manage method metrics
CREATE POLICY "Service role can manage method metrics" 
ON session_method_metrics 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- 3) Add calibration columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS conf_raw NUMERIC,
  ADD COLUMN IF NOT EXISTS conf_calibrated NUMERIC,
  ADD COLUMN IF NOT EXISTS conf_band TEXT;

-- 4) Calibration training view
CREATE OR REPLACE VIEW v_calibration_training AS
SELECT
  p1.session_id as session_id_a,
  p2.session_id as session_id_b,
  p1.type_code as type_a,
  p2.type_code as type_b,
  -- raw predictor we want to calibrate
  COALESCE(p1.conf_raw, p1.top_gap, 0) as raw_conf, 
  -- observed success: 1 if top type replicated on retest
  CASE WHEN p1.type_code = p2.type_code THEN 1 ELSE 0 END as observed,
  -- strata for calibration (dimension band and overlay)
  CASE 
    WHEN GREATEST(
      COALESCE((p1.dimensions->>p1.base_func)::int, 1), 
      COALESCE((p1.dimensions->>p1.creative_func)::int, 1)
    ) >= 3 THEN '3-4D'
    WHEN GREATEST(
      COALESCE((p1.dimensions->>p1.base_func)::int, 1), 
      COALESCE((p1.dimensions->>p1.creative_func)::int, 1)
    ) = 2 THEN '2D'
    ELSE '1D' 
  END as dim_band,
  CASE WHEN p1.overlay = '+' THEN 'plus' ELSE 'minus' END as overlay,
  p1.created_at
FROM v_retest_pairs rp
JOIN profiles p1 ON p1.session_id = rp.session_id_1
JOIN profiles p2 ON p2.session_id = rp.session_id_2
WHERE p1.created_at >= NOW() - INTERVAL '180 days'; -- Last 6 months

-- 5) Enhanced method agreement view 
CREATE OR REPLACE VIEW v_method_agreement AS
SELECT
  DATE_TRUNC('day', smm.created_at) as day,
  -- per function correlations across sessions using z-scored values
  CORR((smm.likert_z->>'Ti')::numeric, (smm.fc_z->>'Ti')::numeric) as r_ti,
  CORR((smm.likert_z->>'Te')::numeric, (smm.fc_z->>'Te')::numeric) as r_te,
  CORR((smm.likert_z->>'Fi')::numeric, (smm.fc_z->>'Fi')::numeric) as r_fi,
  CORR((smm.likert_z->>'Fe')::numeric, (smm.fc_z->>'Fe')::numeric) as r_fe,
  CORR((smm.likert_z->>'Ni')::numeric, (smm.fc_z->>'Ni')::numeric) as r_ni,
  CORR((smm.likert_z->>'Ne')::numeric, (smm.fc_z->>'Ne')::numeric) as r_ne,
  CORR((smm.likert_z->>'Si')::numeric, (smm.fc_z->>'Si')::numeric) as r_si,
  CORR((smm.likert_z->>'Se')::numeric, (smm.fc_z->>'Se')::numeric) as r_se,
  -- overall MAI (mean of correlations)
  (
    COALESCE(CORR((smm.likert_z->>'Ti')::numeric, (smm.fc_z->>'Ti')::numeric), 0) +
    COALESCE(CORR((smm.likert_z->>'Te')::numeric, (smm.fc_z->>'Te')::numeric), 0) +
    COALESCE(CORR((smm.likert_z->>'Fi')::numeric, (smm.fc_z->>'Fi')::numeric), 0) +
    COALESCE(CORR((smm.likert_z->>'Fe')::numeric, (smm.fc_z->>'Fe')::numeric), 0) +
    COALESCE(CORR((smm.likert_z->>'Ni')::numeric, (smm.fc_z->>'Ni')::numeric), 0) +
    COALESCE(CORR((smm.likert_z->>'Ne')::numeric, (smm.fc_z->>'Ne')::numeric), 0) +
    COALESCE(CORR((smm.likert_z->>'Si')::numeric, (smm.fc_z->>'Si')::numeric), 0) +
    COALESCE(CORR((smm.likert_z->>'Se')::numeric, (smm.fc_z->>'Se')::numeric), 0)
  ) / 8.0 as mai,
  COUNT(*) as n_sessions
FROM session_method_metrics smm
WHERE smm.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', smm.created_at);

-- 6) Add new scoring config keys
INSERT INTO scoring_config (key, value) VALUES 
('fc_expected_min', '24'::jsonb),
('conf_raw_params', '{"a":0.25, "b":0.35, "c":0.20}'::jsonb),
('conf_band_cuts', '{"high":0.75, "moderate":0.55}'::jsonb),
('calibration', '{"enabled": true, "method":"isotonic", "cohort_days": 90}'::jsonb)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();