-- Update PRISM scoring system to v1.2.0 with unified calibration
-- This migration ensures all configuration is consistent with the new unified system

-- Update calibration configuration to match unified system
UPDATE scoring_config 
SET value = jsonb_build_object(
  'method', 'isotonic',
  'enabled', true,
  'cohort_days', 90
)
WHERE key = 'calibration';

-- Ensure confidence parameters are properly set
INSERT INTO scoring_config (key, value) 
VALUES ('conf_raw_params', jsonb_build_object('a', 0.25, 'b', 0.35, 'c', 0.20))
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value;

-- Ensure confidence band cuts are properly set
INSERT INTO scoring_config (key, value)
VALUES ('conf_band_cuts', jsonb_build_object('high', 0.75, 'moderate', 0.55))
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value;

-- Ensure fit calibration parameters are properly set
INSERT INTO scoring_config (key, value)
VALUES ('fit_calibration', jsonb_build_object(
  'enabled', true,
  'cohort_days', 90,
  'extreme_cap', jsonb_build_object('min', 20, 'max', 85),
  'target_range', jsonb_build_object('min', 35, 'max', 75),
  'z_score_threshold', 2
))
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value;

-- Update system status to reflect the new version
UPDATE scoring_config 
SET value = jsonb_build_object(
  'status', 'green',
  'message', 'PRISM v1.2.0 unified calibration system active',
  'updated_by', 'system_upgrade',
  'last_updated', now()::text
)
WHERE key = 'system_status';

-- Clean up old calibration models with outdated versions
-- Keep only the latest version to ensure consistency
DELETE FROM calibration_model 
WHERE version NOT IN ('v1.2.0') 
  AND trained_at < now() - interval '7 days';

-- Add comment for tracking
COMMENT ON TABLE calibration_model IS 'PRISM confidence calibration models - unified system v1.2.0';