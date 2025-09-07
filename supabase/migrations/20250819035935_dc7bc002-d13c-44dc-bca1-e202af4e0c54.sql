-- up
DROP VIEW IF EXISTS public.v_recent_assessments_safe;
CREATE VIEW public.v_recent_assessments_safe AS
SELECT 
  p.created_at,
  LEFT(p.type_code, 3) as type_prefix,  -- Only first 3 characters (less identifying)
  p.overlay,
  'Hidden for Privacy' as country_display,  -- Don't expose country
  CASE 
    WHEN p.created_at >= CURRENT_DATE - INTERVAL '1 day' THEN 'Today'
    WHEN p.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 'This week' 
    ELSE 'Earlier'
  END as time_period,
  -- Create a simple, generic fit indicator without exposing detailed scores
  CASE 
    WHEN p.confidence = 'High' THEN 'Strong'
    WHEN p.confidence = 'Moderate' THEN 'Moderate'  
    WHEN p.confidence = 'Low' THEN 'Developing'
    ELSE 'Processing'
  END as fit_indicator
FROM profiles p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'  -- Only recent assessments
ORDER BY p.created_at DESC
LIMIT 50;  -- Limit to prevent large data exposure

-- Set security invoker to respect RLS of underlying tables
ALTER VIEW public.v_recent_assessments_safe SET (security_invoker = true);

-- Retain public read access
GRANT SELECT ON public.v_recent_assessments_safe TO anon, authenticated;

-- down
DROP VIEW IF EXISTS public.v_recent_assessments_safe;
