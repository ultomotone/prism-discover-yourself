-- Safe re-run
DROP VIEW IF EXISTS public.v_recent_assessments_safe_v2;

CREATE VIEW public.v_recent_assessments_safe_v2 AS
SELECT 
  p.created_at,
  LEFT(p.type_code, 3) AS type_prefix,                -- anonymized type
  p.overlay,
  'Hidden for Privacy' AS country_display,            -- never expose country
  CASE 
    WHEN p.created_at >= CURRENT_DATE - INTERVAL '1 day' THEN 'Today'
    WHEN p.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 'This week' 
    ELSE 'Earlier'
  END AS time_period,
  CASE                                                -- coarse fit band
    WHEN p.confidence = 'High' THEN 'Strong'
    WHEN p.confidence = 'Moderate' THEN 'Moderate'  
    WHEN p.confidence = 'Low' THEN 'Developing'
    ELSE 'Processing'
  END AS fit_indicator
FROM public.profiles p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY p.created_at DESC
LIMIT 50;

-- Views don't have RLS; this ONLY controls object access (RLS on tables still applies).
GRANT SELECT ON public.v_recent_assessments_safe_v2 TO anon, authenticated;
