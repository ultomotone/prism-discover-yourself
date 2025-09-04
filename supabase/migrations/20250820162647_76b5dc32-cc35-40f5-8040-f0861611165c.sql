DROP FUNCTION IF EXISTS public.get_recent_assessments_safe();

CREATE OR REPLACE FUNCTION public.get_recent_assessments_safe()
RETURNS TABLE(
  created_at timestamp with time zone, 
  type_display text, 
  country_display text, 
  fit_score numeric, 
  share_pct numeric, 
  fit_band text, 
  confidence text, 
  version text, 
  session_id uuid,
  results_version text,
  score_fit_raw numeric,
  score_fit_calibrated numeric,
  top_gap numeric,
  invalid_combo_flag boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.created_at,
    CONCAT(LEFT(p.type_code, 3), COALESCE(p.overlay, '')) as type_display,
    COALESCE(
      (SELECT ar.answer_value 
       FROM assessment_responses ar 
       JOIN scoring_config sc ON sc.key = 'dashboard_country_qid' 
       WHERE ar.session_id = p.session_id 
       AND ar.question_id = (sc.value->>'id')::integer
       LIMIT 1), 
      'Unknown'
    ) as country_display,
    -- Use calibrated fit first, then raw fit, then legacy fit as fallback
    COALESCE(p.score_fit_calibrated, p.score_fit_raw, 
      CASE 
        WHEN p.top_types IS NOT NULL 
             AND jsonb_array_length(p.top_types) > 0 
             AND p.type_scores IS NOT NULL 
        THEN COALESCE(
          (p.type_scores->(p.top_types->>0)->>'fit_abs')::numeric, 
          0
        )
        ELSE 0
      END
    ) as fit_score,
    -- Get share_pct from type_scores
    CASE 
      WHEN p.top_types IS NOT NULL 
           AND jsonb_array_length(p.top_types) > 0 
           AND p.type_scores IS NOT NULL 
      THEN COALESCE(
        (p.type_scores->(p.top_types->>0)->>'share_pct')::numeric, 
        0
      )
      ELSE 0
    END as share_pct,
    p.fit_band,
    p.confidence,
    COALESCE(p.results_version, p.version, 'pre-v1.1') as version,
    p.session_id,
    p.results_version,
    p.score_fit_raw,
    p.score_fit_calibrated,
    p.top_gap,
    COALESCE(p.invalid_combo_flag, false) as invalid_combo_flag
  FROM profiles p
  WHERE p.created_at >= CURRENT_DATE - INTERVAL '7 days'  -- Only very recent assessments
  ORDER BY p.created_at DESC
  LIMIT 50;  -- Limit for performance
END;
$function$;