-- Update the kpi_country_activity_v11 function to properly handle empty string countries
CREATE OR REPLACE FUNCTION public.kpi_country_activity_v11(start_ts timestamp with time zone DEFAULT (now() - '30 days'::interval), end_ts timestamp with time zone DEFAULT now())
 RETURNS TABLE(country text, sessions bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT 
    COALESCE(NULLIF(TRIM(country), ''), 'Unknown') AS country, 
    COUNT(DISTINCT session_id)::bigint as sessions
  FROM public.v_kpi_metrics_v11
  WHERE created_at BETWEEN start_ts AND end_ts
    AND COALESCE(NULLIF(TRIM(country), ''), 'Unknown') != 'Unknown'  -- Exclude empty strings, null, and 'Unknown'
  GROUP BY COALESCE(NULLIF(TRIM(country), ''), 'Unknown')
  ORDER BY sessions DESC
  LIMIT 50; -- Limit for performance
$function$;