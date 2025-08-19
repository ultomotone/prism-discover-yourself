-- Create a security definer function to safely return anonymized recent assessment data
CREATE OR REPLACE FUNCTION public.get_recent_assessments_safe()
RETURNS TABLE (
  created_at timestamp with time zone,
  type_display text,
  country_display text, 
  fit_indicator text,
  time_period text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.created_at,
    CONCAT(LEFT(p.type_code, 3), COALESCE(p.overlay, '')) as type_display,
    'Hidden for Privacy'::text as country_display,
    CASE 
      WHEN p.confidence = 'High' THEN 'Strong'
      WHEN p.confidence = 'Moderate' THEN 'Moderate'  
      WHEN p.confidence = 'Low' THEN 'Developing'
      ELSE 'Processing'
    END::text as fit_indicator,
    CASE 
      WHEN p.created_at >= CURRENT_DATE - INTERVAL '1 day' THEN 'Today'
      WHEN p.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 'This week' 
      ELSE 'Earlier'
    END::text as time_period
  FROM profiles p
  WHERE p.created_at >= CURRENT_DATE - INTERVAL '7 days'  -- Only very recent assessments
  ORDER BY p.created_at DESC
  LIMIT 20;  -- Limit results
END;
$$;