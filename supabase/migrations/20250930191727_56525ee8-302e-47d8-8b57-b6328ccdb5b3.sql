-- Fix type mismatch in get_assessment_kpis function
DROP FUNCTION IF EXISTS get_assessment_kpis(date, date);

CREATE OR REPLACE FUNCTION get_assessment_kpis(
  start_date date DEFAULT (CURRENT_DATE - INTERVAL '7 days')::date,
  end_date date DEFAULT CURRENT_DATE
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    -- Legacy KPIs (keep for backward compatibility)
    'sessions', (
      SELECT COALESCE(jsonb_agg(row_to_json(s)), '[]'::jsonb)
      FROM (SELECT * FROM mv_kpi_sessions WHERE day >= start_date AND day <= end_date ORDER BY day ASC) s
    ),
    'itemFlags', (
      SELECT COALESCE(jsonb_agg(row_to_json(f)), '[]'::jsonb)
      FROM (SELECT * FROM mv_kpi_item_flags ORDER BY flag_rate DESC NULLS LAST LIMIT 20) f
    ),
    'feedback', (
      SELECT COALESCE(jsonb_agg(row_to_json(fb)), '[]'::jsonb)
      FROM (SELECT * FROM mv_kpi_feedback WHERE day >= start_date AND day <= end_date ORDER BY day ASC) fb
    ),
    'scoring', (
      SELECT COALESCE(jsonb_agg(row_to_json(sc)), '[]'::jsonb)
      FROM (SELECT * FROM mv_kpi_scoring WHERE day >= start_date AND day <= end_date ORDER BY day ASC) sc
    ),
    'alerts', (
      SELECT COALESCE(jsonb_agg(msg), '[]'::jsonb)
      FROM kpi_alerts()
      WHERE msg IS NOT NULL
    ),
    
    -- New comprehensive KPIs
    'engagement', (
      SELECT COALESCE(jsonb_agg(row_to_json(e)), '[]'::jsonb)
      FROM (SELECT * FROM mv_kpi_engagement WHERE day >= start_date AND day <= end_date ORDER BY day ASC) e
    ),
    'itemFlow', (
      SELECT COALESCE(jsonb_agg(row_to_json(f)), '[]'::jsonb)
      FROM (SELECT * FROM mv_kpi_item_flow ORDER BY skip_rate DESC NULLS LAST LIMIT 20) f
    ),
    'itemClarity', (
      SELECT COALESCE(jsonb_agg(row_to_json(c)), '[]'::jsonb)
      FROM (SELECT * FROM mv_kpi_item_clarity ORDER BY clarity_flag_rate_pct DESC NULLS LAST LIMIT 20) c
    ),
    'responseProcess', (
      SELECT COALESCE(jsonb_agg(row_to_json(rp)), '[]'::jsonb)
      FROM (SELECT * FROM mv_kpi_response_process WHERE day >= start_date AND day <= end_date ORDER BY day ASC) rp
    ),
    'reliability', (
      SELECT COALESCE(jsonb_agg(row_to_json(r)), '[]'::jsonb)
      FROM (SELECT * FROM mv_kpi_reliability) r
    ),
    'cfa', (
      SELECT COALESCE(jsonb_agg(row_to_json(cf)), '[]'::jsonb)
      FROM (SELECT * FROM mv_kpi_cfa) cf
    ),
    'constructCoverage', (
      SELECT COALESCE(to_jsonb(row_to_json(cc)), '{}'::jsonb)
      FROM (SELECT * FROM mv_kpi_construct_coverage LIMIT 1) cc
    ),
    'fairness', (
      SELECT COALESCE(to_jsonb(row_to_json(f)), '{}'::jsonb)
      FROM (SELECT * FROM mv_kpi_fairness_dif LIMIT 1) f
    ),
    'calibration', (
      SELECT COALESCE(to_jsonb(row_to_json(cal)), '{}'::jsonb)
      FROM (SELECT * FROM mv_kpi_calibration LIMIT 1) cal
    ),
    'classificationStability', (
      SELECT COALESCE(to_jsonb(row_to_json(cs)), '{}'::jsonb)
      FROM (SELECT * FROM mv_kpi_classification_stability LIMIT 1) cs
    ),
    'confidenceSpread', (
      SELECT COALESCE(to_jsonb(row_to_json(csp)), '{}'::jsonb)
      FROM (SELECT * FROM mv_kpi_confidence_spread LIMIT 1) csp
    ),
    'userExperience', (
      SELECT COALESCE(jsonb_agg(row_to_json(ux)), '[]'::jsonb)
      FROM (SELECT * FROM mv_kpi_user_experience WHERE day >= start_date AND day <= end_date ORDER BY day ASC) ux
    ),
    'business', (
      SELECT COALESCE(to_jsonb(row_to_json(b)), '{}'::jsonb)
      FROM (SELECT * FROM mv_kpi_business LIMIT 1) b
    ),
    'followup', (
      SELECT COALESCE(to_jsonb(row_to_json(fu)), '{}'::jsonb)
      FROM (SELECT * FROM mv_kpi_followup LIMIT 1) fu
    ),
    'behavioralImpact', (
      SELECT COALESCE(to_jsonb(row_to_json(bi)), '{}'::jsonb)
      FROM (SELECT * FROM mv_kpi_behavioral_impact LIMIT 1) bi
    ),
    'trajectoryAlignment', (
      SELECT COALESCE(to_jsonb(row_to_json(ta)), '{}'::jsonb)
      FROM (SELECT * FROM mv_kpi_trajectory_alignment LIMIT 1) ta
    )
  ) INTO result;
  
  RETURN result;
END $$;