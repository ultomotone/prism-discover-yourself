-- Phase 2 performance and monitoring improvements

-- Additional indexes for filtering and performance
CREATE INDEX IF NOT EXISTS scoring_results_type_code_idx ON public.scoring_results(type_code);
CREATE INDEX IF NOT EXISTS scoring_results_confidence_idx ON public.scoring_results(confidence);

-- GIN index for payload JSON queries (if needed for analytics)
CREATE INDEX IF NOT EXISTS scoring_results_payload_gin ON public.scoring_results USING gin (payload jsonb_path_ops);

-- Create health monitoring RPC function
CREATE OR REPLACE FUNCTION public.get_scoring_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  unified_count int;
  profiles_count int;
  types_count int;
  functions_count int;
  state_count int;
  current_version text;
BEGIN
  -- Get current scoring version from config
  SELECT value #>> '{}' INTO current_version 
  FROM public.scoring_config 
  WHERE key = 'results_version';
  
  -- Count rows in each table
  SELECT COUNT(*) INTO unified_count FROM public.scoring_results;
  SELECT COUNT(*) INTO profiles_count FROM public.profiles;
  SELECT COUNT(*) INTO types_count FROM public.scoring_results_types;
  SELECT COUNT(*) INTO functions_count FROM public.scoring_results_functions;
  SELECT COUNT(*) INTO state_count FROM public.scoring_results_state;
  
  result := jsonb_build_object(
    'current_version', COALESCE(current_version, 'unknown'),
    'write_exploded', COALESCE(current_setting('PRISM_WRITE_EXPLODED', true), 'false'),
    'row_counts', jsonb_build_object(
      'unified_scoring_results', unified_count,
      'legacy_profiles', profiles_count,
      'legacy_types', types_count,
      'legacy_functions', functions_count,
      'legacy_state', state_count
    ),
    'migration_status', CASE 
      WHEN unified_count = 0 THEN 'not_started'
      WHEN unified_count < profiles_count THEN 'in_progress'
      ELSE 'complete'
    END,
    'health_check_at', now()
  );
  
  RETURN result;
END;
$function$;

-- Create minimal view for dashboards
CREATE OR REPLACE VIEW public.v_results_min AS
SELECT 
  session_id, 
  type_code, 
  confidence, 
  scoring_version, 
  computed_at,
  user_id
FROM public.scoring_results;

-- Create verification query function for missing unified results
CREATE OR REPLACE FUNCTION public.get_sessions_missing_unified_results(limit_count integer DEFAULT 50)
RETURNS TABLE(session_id uuid, status text, completed_at timestamptz, has_profile boolean, has_types boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as session_id,
    s.status,
    s.completed_at,
    (p.session_id IS NOT NULL) as has_profile,
    (EXISTS(SELECT 1 FROM scoring_results_types t WHERE t.session_id = s.id)) as has_types
  FROM public.assessment_sessions s
  LEFT JOIN public.scoring_results r ON r.session_id = s.id
  LEFT JOIN public.profiles p ON p.session_id = s.id
  WHERE r.session_id IS NULL
    AND s.status = 'completed'
  ORDER BY s.completed_at DESC
  LIMIT limit_count;
END;
$function$;