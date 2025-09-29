-- Add missing scoring configuration values
INSERT INTO public.scoring_config (key, value) VALUES 
('conf_raw_params', '{"a": 2.5, "b": 8.0, "c": 1.2}'),
('fit_band_thresholds', '{"high_fit": 3.5, "moderate_fit": 2.5, "high_gap": 0.8, "moderate_gap": 0.4}')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();