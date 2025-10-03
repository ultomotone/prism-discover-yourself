-- Update refresh_all_materialized_views to include mv_kpi_post_survey
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
  
  RETURN jsonb_build_object(
    'success', true, 
    'duration_ms', EXTRACT(EPOCH FROM (now() - v_start)) * 1000, 
    'errors', v_errors, 
    'timestamp', now()
  );
END
$function$;

-- Setup cron job for daily feedback reminders at 10 AM UTC
SELECT cron.schedule(
  'daily-feedback-reminders',
  '0 10 * * *', -- Every day at 10:00 AM UTC
  $$
  SELECT net.http_post(
    url:='https://gnkuikentdtnatazeriu.supabase.co/functions/v1/send-feedback-reminders',
    headers:='{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
