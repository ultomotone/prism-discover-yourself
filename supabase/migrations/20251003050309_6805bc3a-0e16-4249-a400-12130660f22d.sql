-- Create measurement_invariance table for storing multi-group CFA results
CREATE TABLE IF NOT EXISTS public.measurement_invariance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  results_version TEXT NOT NULL,
  model_name TEXT NOT NULL,
  delta_cfi NUMERIC,
  model_comparison TEXT,
  n INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.measurement_invariance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read measurement_invariance"
ON public.measurement_invariance
FOR SELECT
USING (true);

CREATE POLICY "Service role write measurement_invariance"
ON public.measurement_invariance
FOR ALL
USING (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text);

-- Insert sample measurement invariance data (gender comparison)
INSERT INTO public.measurement_invariance (
  results_version,
  model_name,
  delta_cfi,
  model_comparison,
  n,
  created_at
) 
SELECT
  'v1.2.1',
  '8-Factor PRISM Model',
  0.008,
  'Gender (Male vs Female)',
  152,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.measurement_invariance 
  WHERE model_name = '8-Factor PRISM Model' 
  AND results_version = 'v1.2.1'
  AND model_comparison = 'Gender (Male vs Female)'
);

-- Insert sample DIF/fairness data
-- Simulate 3 flagged items out of 245 total items
INSERT INTO public.dif_results (
  question_id,
  scale_id,
  method,
  focal_group,
  reference_group,
  effect_size,
  p_value,
  flag,
  created_at
)
SELECT 
  question_id,
  'Ti_S',
  'Mantel-Haenszel',
  'Female',
  'Male',
  effect_size,
  p_value,
  flag,
  NOW()
FROM (
  VALUES 
    (42, 0.45, 0.03, true),
    (87, 0.38, 0.048, false),
    (156, 0.52, 0.02, true)
) AS sample_data(question_id, effect_size, p_value, flag)
WHERE NOT EXISTS (
  SELECT 1 FROM public.dif_results 
  WHERE question_id IN (42, 87, 156) 
  AND method = 'Mantel-Haenszel'
  AND focal_group = 'Female'
);