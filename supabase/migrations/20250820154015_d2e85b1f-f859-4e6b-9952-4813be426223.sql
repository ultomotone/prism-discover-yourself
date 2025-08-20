-- Part A: Result delivery hardening - new profile columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS results_version text DEFAULT 'v1.1';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS score_fit_raw numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS score_fit_calibrated numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fit_band text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS top_gap numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invalid_combo_flag boolean DEFAULT false;

-- Create unique index to prevent duplicate profiles per session
CREATE UNIQUE INDEX IF NOT EXISTS ux_profiles_session ON profiles(session_id);
CREATE INDEX IF NOT EXISTS ix_profiles_version ON profiles(results_version);

-- Part B: Type guard configuration
INSERT INTO scoring_config (key, value) VALUES 
('enforce_type_guard', '{"enabled": true}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Part C: Valid type combinations for type guard
INSERT INTO scoring_config (key, value) VALUES 
('valid_type_combinations', '{
  "LIE": {"base": "Te", "creative": "Ni", "valid": true},
  "ILI": {"base": "Ni", "creative": "Te", "valid": true},
  "ESE": {"base": "Fe", "creative": "Si", "valid": true},
  "SEI": {"base": "Si", "creative": "Fe", "valid": true},
  "LII": {"base": "Ti", "creative": "Ne", "valid": true},
  "ILE": {"base": "Ne", "creative": "Ti", "valid": true},
  "ESI": {"base": "Fi", "creative": "Se", "valid": true},
  "SEE": {"base": "Se", "creative": "Fi", "valid": true},
  "LSE": {"base": "Te", "creative": "Si", "valid": true},
  "SLI": {"base": "Si", "creative": "Te", "valid": true},
  "EIE": {"base": "Fe", "creative": "Ni", "valid": true},
  "IEI": {"base": "Ni", "creative": "Fe", "valid": true},
  "LSI": {"base": "Ti", "creative": "Se", "valid": true},
  "SLE": {"base": "Se", "creative": "Ti", "valid": true},
  "EII": {"base": "Fi", "creative": "Ne", "valid": true},
  "IEE": {"base": "Ne", "creative": "Fi", "valid": true}
}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Part D: Calibration configuration 
INSERT INTO scoring_config (key, value) VALUES 
('fit_calibration', '{
  "enabled": true,
  "cohort_days": 90,
  "target_range": {"min": 35, "max": 75},
  "extreme_cap": {"min": 20, "max": 85},
  "z_score_threshold": 2.0
}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Part E: Fit band thresholds
INSERT INTO scoring_config (key, value) VALUES 
('fit_bands', '{
  "high": {"fit_min": 60, "gap_min": 5},
  "moderate": {"fit_min": 45, "fit_max": 59, "gap_min": 2, "gap_max": 5},
  "low": {"fit_max": 44, "gap_max": 2}
}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;