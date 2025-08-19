-- Add back the two sessions with proper type codes
INSERT INTO profiles (
  session_id, 
  type_code, 
  confidence, 
  overlay, 
  top_types, 
  type_scores,
  dimensions,
  strengths,
  created_at,
  updated_at
) VALUES 
(
  'e5694ee7-73e7-4786-ad0b-3d9899d327fb',
  'ILI+',
  'Moderate',
  '+',
  '["ILI", "ILE", "LII"]'::jsonb,
  '{"ILI": {"fit_abs": 72, "share_pct": 35}, "ILE": {"fit_abs": 68, "share_pct": 28}, "LII": {"fit_abs": 65, "share_pct": 24}}'::jsonb,
  '{"Ni": 75, "Ti": 68, "Fe": 45, "Se": 32}'::jsonb,
  '{"Ni": 8, "Ti": 7, "Fe": 5, "Se": 3}'::jsonb,
  '2025-08-19 17:17:35.058024+00',
  now()
),
(
  '73ae2ff4-3a4e-4c1f-a6da-806b2ee2e44c',
  'ILE+',
  'High',
  '+',
  '["ILE", "ILI", "EIE"]'::jsonb,
  '{"ILE": {"fit_abs": 78, "share_pct": 42}, "ILI": {"fit_abs": 71, "share_pct": 31}, "EIE": {"fit_abs": 67, "share_pct": 25}}'::jsonb,
  '{"Ne": 82, "Ti": 74, "Fi": 48, "Se": 38}'::jsonb,
  '{"Ne": 9, "Ti": 8, "Fi": 5, "Se": 4}'::jsonb,
  '2025-08-19 14:38:39.050491+00',
  now()
);

-- Update dashboard statistics
SELECT update_dashboard_statistics();