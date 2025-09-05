DO $$
BEGIN
  EXECUTE $sql$
    CREATE OR REPLACE VIEW public.v_recent_assessments_safe_v2 AS
    SELECT
      p.created_at,
      LEFT(p.type_code, 3) AS type_prefix,
      p.overlay,
      'Hidden for Privacy' AS country_display,
      CASE
        WHEN p.created_at >= CURRENT_DATE - INTERVAL '1 day' THEN 'Today'
        WHEN p.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 'This week'
        ELSE 'Earlier'
      END AS time_period,
      CASE
        WHEN p.confidence = 'High'     THEN 'Strong'
        WHEN p.confidence = 'Moderate' THEN 'Moderate'
        WHEN p.confidence = 'Low'      THEN 'Developing'
        ELSE 'Processing'
      END AS fit_indicator
    FROM public.profiles p
    WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
    ORDER BY p.created_at DESC
    LIMIT 50
  $sql$;

  EXECUTE 'ALTER VIEW public.v_recent_assessments_safe_v2 SET (security_invoker = true)';
  EXECUTE 'GRANT SELECT ON public.v_recent_assessments_safe_v2 TO anon, authenticated';
END
$$;
