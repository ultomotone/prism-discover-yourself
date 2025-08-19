-- Create a secure statistics view that exposes only aggregated, non-sensitive data
-- This replaces the need for public access to the full profiles table

CREATE OR REPLACE VIEW public.v_dashboard_stats AS
SELECT 
  DATE(created_at) as assessment_date,
  COUNT(*) as daily_count,
  -- Aggregate overlay distribution (no individual data)
  COUNT(CASE WHEN overlay = '+' THEN 1 END) as overlay_positive,
  COUNT(CASE WHEN overlay = '–' THEN 1 END) as overlay_negative,
  COUNT(CASE WHEN overlay IS NULL OR overlay = '' THEN 1 END) as overlay_unknown,
  -- Type distribution by first 3 characters only (less sensitive)
  COUNT(CASE WHEN LEFT(type_code, 3) = 'LIE' THEN 1 END) as type_lie,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'ILI' THEN 1 END) as type_ili,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'ESE' THEN 1 END) as type_ese,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'SEI' THEN 1 END) as type_sei,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'LII' THEN 1 END) as type_lii,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'ILE' THEN 1 END) as type_ile,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'ESI' THEN 1 END) as type_esi,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'SEE' THEN 1 END) as type_see,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'LSE' THEN 1 END) as type_lse,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'SLI' THEN 1 END) as type_sli,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'EIE' THEN 1 END) as type_eie,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'IEI' THEN 1 END) as type_iei,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'LSI' THEN 1 END) as type_lsi,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'SLE' THEN 1 END) as type_sle,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'EII' THEN 1 END) as type_eii,
  COUNT(CASE WHEN LEFT(type_code, 3) = 'IEE' THEN 1 END) as type_iee
FROM profiles 
WHERE created_at >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY DATE(created_at)
ORDER BY assessment_date DESC;

-- Enable RLS on the new view
ALTER VIEW public.v_dashboard_stats SET (security_invoker = true);

-- Create a simple aggregated stats table that updates periodically
CREATE TABLE IF NOT EXISTS public.dashboard_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date date NOT NULL DEFAULT CURRENT_DATE,
  total_assessments integer NOT NULL DEFAULT 0,
  daily_assessments integer NOT NULL DEFAULT 0,
  overlay_positive integer NOT NULL DEFAULT 0,
  overlay_negative integer NOT NULL DEFAULT 0,
  type_distribution jsonb DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(stat_date)
);

-- Enable RLS on dashboard statistics (publicly readable aggregated data only)
ALTER TABLE public.dashboard_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dashboard statistics are publicly readable" 
ON public.dashboard_statistics 
FOR SELECT 
USING (true);

-- Only service role can update statistics
CREATE POLICY "Service role can manage dashboard statistics" 
ON public.dashboard_statistics 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create function to update dashboard statistics (runs with service role privileges)
CREATE OR REPLACE FUNCTION public.update_dashboard_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update today's statistics
  INSERT INTO public.dashboard_statistics (
    stat_date,
    total_assessments,
    daily_assessments,
    overlay_positive,
    overlay_negative,
    type_distribution
  )
  SELECT 
    CURRENT_DATE,
    (SELECT COUNT(*) FROM profiles),
    (SELECT COUNT(*) FROM profiles WHERE DATE(created_at) = CURRENT_DATE),
    (SELECT COUNT(*) FROM profiles WHERE overlay = '+'),
    (SELECT COUNT(*) FROM profiles WHERE overlay = '–'),
    (SELECT jsonb_object_agg(
      type_prefix, 
      type_count
    ) FROM (
      SELECT 
        LEFT(type_code, 3) as type_prefix,
        COUNT(*) as type_count
      FROM profiles 
      WHERE type_code IS NOT NULL 
      GROUP BY LEFT(type_code, 3)
    ) t)
  ON CONFLICT (stat_date) 
  DO UPDATE SET
    total_assessments = EXCLUDED.total_assessments,
    daily_assessments = EXCLUDED.daily_assessments,
    overlay_positive = EXCLUDED.overlay_positive,
    overlay_negative = EXCLUDED.overlay_negative,
    type_distribution = EXCLUDED.type_distribution,
    updated_at = now();
END;
$$;

-- Initial population of statistics
SELECT public.update_dashboard_statistics();