-- Phase 5: Enhanced calibration system configuration and model metadata

-- Add calibration configuration with enhanced defaults
INSERT INTO scoring_config (key, value)
VALUES ('calibration_config', '{
  "enabled": true,
  "method": "isotonic",
  "cohort_days": 90,
  "min_sample_size": 15,
  "min_stratum_size": 8,
  "validation_split": 0.2,
  "auto_retrain_threshold": 0.15,
  "max_model_age_days": 14
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- Add columns to calibration_model for enhanced tracking
ALTER TABLE calibration_model 
ADD COLUMN IF NOT EXISTS training_size integer,
ADD COLUMN IF NOT EXISTS validation_size integer,
ADD COLUMN IF NOT EXISTS total_sample_size integer,
ADD COLUMN IF NOT EXISTS calibration_error numeric,
ADD COLUMN IF NOT EXISTS brier_score numeric;

-- Create index for faster calibration lookups with proper JSON operators
DROP INDEX IF EXISTS idx_calibration_model_stratum_lookup;
CREATE INDEX idx_calibration_model_stratum_lookup 
ON calibration_model (version, (stratum->>'dim_band'), (stratum->>'overlay'), trained_at DESC);