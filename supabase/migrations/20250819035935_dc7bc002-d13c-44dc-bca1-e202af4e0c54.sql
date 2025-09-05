-- Create a simpler privacy-safe view for recent assessments without RLS policies
CREATE OR REPLACE VIEW public.v_recent_assessments_safe AS
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

DO $$
BEGIN
  IF to_regclass('public.v_recent_assessments_safe') IS NOT NULL THEN
    EXECUTE 'ALTER VIEW public.v_recent_assessments_safe SET (security_invoker = true)';
    EXECUTE 'GRANT SELECT ON public.v_recent_assessments_safe TO anon, authenticated';
  ELSE
    RAISE NOTICE 'Skipping grants: public.v_recent_assessments_safe not present.';
  END IF;
END
$$;
