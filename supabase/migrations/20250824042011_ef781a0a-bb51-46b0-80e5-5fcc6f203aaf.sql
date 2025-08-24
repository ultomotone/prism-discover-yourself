-- Phase 4: Config/Band audit – ensure thresholds and cuts exist in scoring_config

-- Confidence band cuts (calibrated confidence -> band)
INSERT INTO scoring_config (key, value)
VALUES ('conf_band_cuts', '{"high":0.75, "moderate":0.55}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Fit band thresholds (fit % and top gap)
INSERT INTO scoring_config (key, value)
VALUES ('fit_band_thresholds', '{"high_fit":60, "moderate_fit":45, "high_gap":5, "moderate_gap":2}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Raw confidence parameters (for calculateRawConfidence)
INSERT INTO scoring_config (key, value)
VALUES ('conf_raw_params', '{"a":0.25, "b":0.35, "c":0.20}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();