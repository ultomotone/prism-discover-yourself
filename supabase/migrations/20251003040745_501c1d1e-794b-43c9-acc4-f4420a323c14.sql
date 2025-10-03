-- Phase 1: Schema Updates for Split-Half Reliability & Item Discrimination

-- 1) Add Split-Half columns to existing psychometrics_external table
ALTER TABLE public.psychometrics_external
  ADD COLUMN IF NOT EXISTS split_half_sb numeric,
  ADD COLUMN IF NOT EXISTS split_half_n integer;

-- 2) Create per-item discrimination statistics table
CREATE TABLE IF NOT EXISTS public.psychometrics_item_stats (
  id bigserial PRIMARY KEY,
  results_version text NOT NULL,
  scale_code text NOT NULL,
  question_id integer NOT NULL,
  r_it numeric,
  n_used integer,
  computed_at timestamptz DEFAULT now(),
  UNIQUE (results_version, question_id)
);

-- 3) Create view for active scale-item mappings (corrected to use actual schema)
CREATE OR REPLACE VIEW public.v_active_scale_items AS
SELECT
  sk.tag AS scale_code,
  sk.question_id,
  sk.weight,
  sk.reverse_scored,
  q.type AS question_type
FROM public.assessment_scoring_key sk
JOIN public.assessment_questions q ON q.id = sk.question_id
WHERE sk.scale_type != 'META'
  AND sk.tag IS NOT NULL
  AND COALESCE(q.required, true) = true;

-- 4) Create RPC function to refresh psychometric materialized views
CREATE OR REPLACE FUNCTION public.refresh_psych_kpis()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_reliability;
  EXCEPTION WHEN undefined_table THEN NULL; END;
  
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_construct_coverage;
  EXCEPTION WHEN undefined_table THEN NULL; END;
  
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_post_survey;
  EXCEPTION WHEN undefined_table THEN NULL; END;
END$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.refresh_psych_kpis() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_psych_kpis() TO anon, authenticated, service_role;

-- 5) Optional: Add daily cron schedule (requires pg_cron extension)
-- Uncomment if pg_cron is available:
-- SELECT cron.schedule(
--   'psych_kpis_daily_refresh',
--   '15 3 * * *',
--   $$SELECT public.refresh_psych_kpis();$$
-- );