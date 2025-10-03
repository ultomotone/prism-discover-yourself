-- Integrate psychometric KPIs into refresh_all_materialized_views
CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_start timestamptz := now();
  v_errors jsonb := '[]'::jsonb;
BEGIN
  -- Standard KPI views
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_engagement;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_engagement', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_reliability;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_reliability', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_construct_coverage;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_construct_coverage', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_calibration;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_calibration', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_classification_stability;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_classification_stability', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_retest;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_retest', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_fairness_dif;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_fairness_dif', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_split_half;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_split_half', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_cfa;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_cfa', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_items_discrimination;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_items_discrimination', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_post_survey;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_post_survey', 'error', SQLERRM); END;
  
  -- NEW: Psychometric views (with real session data)
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_scale_corr;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_scale_corr', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_ave_cr;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_ave_cr', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_internal;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_internal', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_external;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_external', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_stability;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_stability', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_scale_norms;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_scale_norms', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_neuroticism;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_neuroticism', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_invariance;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_invariance', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_release_gates;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_release_gates', 'error', SQLERRM); END;
  
  RETURN jsonb_build_object(
    'success', true, 
    'duration_ms', EXTRACT(EPOCH FROM (now() - v_start)) * 1000, 
    'errors', v_errors, 
    'timestamp', now()
  );
END
$function$;