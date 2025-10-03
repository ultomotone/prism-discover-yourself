-- Insert sample CFA fit indices for 8-Factor PRISM Model
INSERT INTO public.cfa_fit (
  model_name,
  results_version,
  n,
  cfi,
  tli,
  rmsea,
  srmr,
  created_at
) 
SELECT
  '8-Factor PRISM Model',
  'v1.2.1',
  152,
  0.952,
  0.941,
  0.056,
  0.061,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.cfa_fit 
  WHERE model_name = '8-Factor PRISM Model' 
  AND results_version = 'v1.2.1'
);