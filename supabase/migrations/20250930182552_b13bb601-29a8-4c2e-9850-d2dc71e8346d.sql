-- ============================================================================
-- Comprehensive KPI System - Final
-- ============================================================================

-- Schema extensions
ALTER TABLE assessment_responses ADD COLUMN IF NOT EXISTS skipped boolean DEFAULT false;
ALTER TABLE assessment_feedback ADD COLUMN IF NOT EXISTS behavioral_change boolean;

-- Psychometric structure tables
CREATE TABLE IF NOT EXISTS scale_catalog (
  scale_id text PRIMARY KEY,
  result_version text NOT NULL DEFAULT 'v1.2.1',
  scale_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS item_catalog (
  question_id integer PRIMARY KEY REFERENCES assessment_questions(id) ON DELETE CASCADE,
  scale_id text REFERENCES scale_catalog(scale_id),
  keyed integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS psychometrics_external (
  scale_id text REFERENCES scale_catalog(scale_id),
  question_id integer REFERENCES assessment_questions(id),
  results_version text DEFAULT 'v1.2.1',
  omega numeric, factor_loading numeric,
  cfi numeric, tli numeric, rmsea numeric, srmr numeric, dif_flag boolean,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (scale_id, question_id, results_version)
);

CREATE TABLE IF NOT EXISTS retest_invites (
  user_id uuid,
  session_id uuid REFERENCES assessment_sessions(id),
  invited_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  PRIMARY KEY(user_id, session_id)
);

-- Enable RLS
DO $$ BEGIN ALTER TABLE scale_catalog ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE item_catalog ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE psychometrics_external ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE retest_invites ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- RLS Policies
DROP POLICY IF EXISTS "Public read scale_catalog" ON scale_catalog;
CREATE POLICY "Public read scale_catalog" ON scale_catalog FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read item_catalog" ON item_catalog;
CREATE POLICY "Public read item_catalog" ON item_catalog FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role write psychometrics" ON psychometrics_external;
CREATE POLICY "Service role write psychometrics" ON psychometrics_external FOR ALL 
  USING (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text);

DROP POLICY IF EXISTS "Users read own retest invites" ON retest_invites;
CREATE POLICY "Users read own retest invites" ON retest_invites FOR SELECT USING (auth.uid() = user_id);

-- Materialized Views
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_engagement AS
SELECT date_trunc('day', s.started_at)::date AS day, COUNT(*) AS sessions_started, 
  COUNT(*) FILTER (WHERE s.status='completed') AS sessions_completed,
  (COUNT(*) - COUNT(*) FILTER (WHERE s.status='completed'))::decimal / NULLIF(COUNT(*),0) AS drop_off_rate,
  AVG(EXTRACT(EPOCH FROM (s.completed_at - s.started_at))) FILTER (WHERE s.completed_at IS NOT NULL) AS avg_completion_sec,
  STDDEV_POP(EXTRACT(EPOCH FROM (s.completed_at - s.started_at))) FILTER (WHERE s.completed_at IS NOT NULL) AS completion_time_sd_sec
FROM assessment_sessions s WHERE s.started_at >= CURRENT_DATE - INTERVAL '90 days' GROUP BY 1;
CREATE UNIQUE INDEX IF NOT EXISTS mv_kpi_engagement_day_idx ON mv_kpi_engagement(day);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_item_flow AS
WITH presented AS (SELECT session_id, question_id FROM assessment_ui_events WHERE event_type = 'present' GROUP BY 1,2),
answered AS (SELECT session_id, question_id, response_time_ms, COALESCE(skipped, false) AS skipped FROM assessment_responses)
SELECT q.id AS question_id, COUNT(p.*) AS presented_ct, COUNT(a.*) AS answered_ct, AVG(a.response_time_ms) AS avg_time_ms,
  CASE WHEN SUM((a.skipped::int)) > 0 THEN SUM((a.skipped::int))::decimal / NULLIF(COUNT(p.*),0)
       ELSE (COUNT(p.*) - COUNT(a.*))::decimal / NULLIF(COUNT(p.*),0) END AS skip_rate
FROM assessment_questions q LEFT JOIN presented p ON p.question_id = q.id LEFT JOIN answered a ON a.question_id = q.id GROUP BY 1;
CREATE UNIQUE INDEX IF NOT EXISTS mv_kpi_item_flow_qid_idx ON mv_kpi_item_flow(question_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_item_clarity AS
SELECT q.id AS question_id, COUNT(r.*) AS answered_ct, COUNT(f.*) AS flags_ct,
  100.0 * COUNT(f.*)::decimal / NULLIF(COUNT(r.*),0) AS clarity_flag_rate_pct
FROM assessment_questions q 
LEFT JOIN assessment_responses r ON r.question_id = q.id AND r.answer_numeric IS NOT NULL
LEFT JOIN assessment_item_flags f ON f.question_id = q.id GROUP BY 1;
CREATE UNIQUE INDEX IF NOT EXISTS mv_kpi_item_clarity_qid_idx ON mv_kpi_item_clarity(question_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_response_process AS
WITH daily_responses AS (SELECT date_trunc('day', ss.started_at)::date AS day, COUNT(*) AS response_count
  FROM assessment_responses ar JOIN assessment_sessions ss ON ss.id = ar.session_id
  WHERE ss.started_at >= CURRENT_DATE - INTERVAL '90 days' GROUP BY 1),
daily_flags AS (SELECT date_trunc('day', fif.created_at)::date AS day, COUNT(*) AS flag_count
  FROM assessment_item_flags fif WHERE fif.created_at >= CURRENT_DATE - INTERVAL '90 days' GROUP BY 1)
SELECT date_trunc('day', f.submitted_at)::date AS day, AVG(f.clarity_overall) AS post_clarity_mean,
  COALESCE(df.flag_count::decimal / NULLIF(dr.response_count, 0), 0) AS not_sure_usage_rate
FROM assessment_feedback f
LEFT JOIN daily_responses dr ON dr.day = date_trunc('day', f.submitted_at)::date
LEFT JOIN daily_flags df ON df.day = date_trunc('day', f.submitted_at)::date
WHERE f.submitted_at >= CURRENT_DATE - INTERVAL '90 days' GROUP BY 1, df.flag_count, dr.response_count;
CREATE UNIQUE INDEX IF NOT EXISTS mv_kpi_response_process_day_idx ON mv_kpi_response_process(day);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_reliability_alpha AS
WITH item_scores AS (SELECT r.session_id, ic.scale_id, r.question_id, (COALESCE(r.answer_numeric,0) * COALESCE(ic.keyed,1))::numeric AS v
  FROM assessment_responses r JOIN item_catalog ic ON ic.question_id = r.question_id),
per_scale AS (SELECT scale_id, session_id, SUM(v) AS total, COUNT(*) AS k FROM item_scores GROUP BY 1,2),
item_vars AS (SELECT scale_id, question_id, VAR_POP(v) AS var_item FROM item_scores GROUP BY 1,2),
scale_vars AS (SELECT scale_id, VAR_POP(total) AS var_total, MAX(k) AS k FROM per_scale GROUP BY 1)
SELECT sv.scale_id,
  CASE WHEN sv.k > 1 AND sv.var_total > 0
    THEN (sv.k::numeric/(sv.k-1)) * (1 - ((SELECT COALESCE(SUM(var_item),0) FROM item_vars iv WHERE iv.scale_id = sv.scale_id) / sv.var_total))
    ELSE NULL END AS cronbach_alpha, sv.k FROM scale_vars sv;
CREATE UNIQUE INDEX IF NOT EXISTS mv_kpi_reliability_alpha_scale_idx ON mv_kpi_reliability_alpha(scale_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_reliability_split_half AS
WITH numbered AS (SELECT ic.scale_id, r.session_id, r.question_id,
    ROW_NUMBER() OVER (PARTITION BY r.session_id, ic.scale_id ORDER BY r.question_id) AS rn,
    (COALESCE(r.answer_numeric,0) * COALESCE(ic.keyed,1))::numeric AS v
  FROM assessment_responses r JOIN item_catalog ic ON ic.question_id = r.question_id),
halves AS (SELECT scale_id, session_id, SUM(v) FILTER (WHERE rn % 2 = 1) AS odd_sum, SUM(v) FILTER (WHERE rn % 2 = 0) AS even_sum FROM numbered GROUP BY 1,2)
SELECT scale_id, CORR(odd_sum, even_sum) AS split_half_corr FROM halves GROUP BY 1;
CREATE UNIQUE INDEX IF NOT EXISTS mv_kpi_reliability_split_half_scale_idx ON mv_kpi_reliability_split_half(scale_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_reliability AS
SELECT sc.scale_id, a.cronbach_alpha, s.split_half_corr, MAX(pe.omega) AS mcdonald_omega
FROM scale_catalog sc
LEFT JOIN mv_kpi_reliability_alpha a USING (scale_id)
LEFT JOIN mv_kpi_reliability_split_half s USING (scale_id)
LEFT JOIN psychometrics_external pe USING (scale_id) GROUP BY 1,2,3;
CREATE UNIQUE INDEX IF NOT EXISTS mv_kpi_reliability_scale_idx ON mv_kpi_reliability(scale_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_cfa AS
SELECT scale_id, question_id, factor_loading, cfi, tli, rmsea, srmr FROM psychometrics_external;
CREATE UNIQUE INDEX IF NOT EXISTS mv_kpi_cfa_idx ON mv_kpi_cfa(scale_id, question_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_construct_coverage AS
SELECT (COUNT(*) FILTER (WHERE cronbach_alpha >= 0.70))::decimal / NULLIF(COUNT(*),0) AS construct_coverage_index
FROM mv_kpi_reliability_alpha;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_fairness_dif AS
SELECT (COUNT(*) FILTER (WHERE dif_flag IS TRUE))::decimal / NULLIF(COUNT(*),0) AS dif_flag_rate FROM psychometrics_external;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_calibration AS
WITH preds AS (SELECT conf_calibrated AS conf, CASE WHEN validity_status = 'pass' THEN 1 ELSE 0 END AS correct
  FROM profiles WHERE conf_calibrated IS NOT NULL),
binned AS (SELECT WIDTH_BUCKET(conf, 0, 1, 10) AS bin, AVG(conf) AS p_expected, AVG(correct::int) AS p_observed, COUNT(*) AS n FROM preds GROUP BY 1),
ece AS (SELECT SUM(ABS(p_expected - p_observed) * (n::decimal / (SELECT SUM(n) FROM binned))) AS ece FROM binned)
SELECT ece FROM ece;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_classification_stability AS
WITH per_user AS (SELECT s.user_id, p.created_at AS submitted_at, p.type_code,
    ROW_NUMBER() OVER (PARTITION BY s.user_id ORDER BY p.created_at ASC) AS rn
  FROM profiles p JOIN assessment_sessions s ON s.id = p.session_id WHERE s.user_id IS NOT NULL),
pairs AS (SELECT a.user_id, a.type_code AS type1, b.type_code AS type2, (b.submitted_at - a.submitted_at) AS delta
  FROM per_user a JOIN per_user b ON a.user_id=b.user_id AND b.rn=a.rn+1
  WHERE b.submitted_at <= a.submitted_at + INTERVAL '42 days')
SELECT AVG((type1 = type2)::int)::decimal AS classification_stability FROM pairs;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_confidence_spread AS
SELECT VAR_POP(conf_calibrated) AS confidence_variance FROM profiles WHERE conf_calibrated IS NOT NULL;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_user_experience AS
SELECT date_trunc('day', f.submitted_at)::date AS day, AVG(f.focus_ease) AS engagement_rating,
  AVG((f.actionability::int)) AS actionable_insights_pct, AVG(f.perceived_accuracy) AS accuracy_perception
FROM assessment_feedback f WHERE f.submitted_at >= CURRENT_DATE - INTERVAL '90 days' GROUP BY 1;
CREATE UNIQUE INDEX IF NOT EXISTS mv_kpi_user_experience_day_idx ON mv_kpi_user_experience(day);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_business AS
WITH completed AS (SELECT id AS session_id, user_id FROM assessment_sessions WHERE status='completed' AND created_at >= CURRENT_DATE - INTERVAL '90 days'),
paywall AS (SELECT session_id, MIN(created_at) AS first_seen FROM assessment_ui_events WHERE event_type='paywall_view' GROUP BY 1),
purchases AS (SELECT e.user_id, MIN(e.granted_at) AS purchased_at FROM entitlements e WHERE e.product_code='insights_plus' AND e.active GROUP BY 1),
joined AS (SELECT c.user_id, c.session_id, (p.session_id IS NOT NULL) AS saw_paywall, (pu.user_id IS NOT NULL) AS paid
  FROM completed c LEFT JOIN paywall p ON p.session_id = c.session_id LEFT JOIN purchases pu ON pu.user_id = c.user_id)
SELECT AVG(paid::int)::decimal AS free_to_paid_rate, 0::decimal AS arpu_completed,
  (COUNT(*) FILTER (WHERE saw_paywall AND NOT paid))::decimal / NULLIF((COUNT(*) FILTER (WHERE saw_paywall)),0) AS paywall_abandon_rate FROM joined;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_followup AS
SELECT (SELECT COUNT(*) FROM assessment_feedback)::decimal / NULLIF((SELECT COUNT(*) FROM assessment_sessions WHERE status='completed'),0) AS followup_completion_rate;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_behavioral_impact AS
SELECT AVG((behavioral_change::int))::decimal AS behavioral_impact_pct FROM assessment_feedback WHERE behavioral_change IS NOT NULL;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_trajectory_alignment AS
WITH base AS (SELECT session_id, conf_calibrated AS conf FROM profiles WHERE conf_calibrated IS NOT NULL),
joiner AS (SELECT b.conf, (f.behavioral_change::int) AS changed FROM base b 
  JOIN assessment_feedback f ON f.session_id = b.session_id WHERE b.conf IS NOT NULL AND f.behavioral_change IS NOT NULL)
SELECT CORR(conf, changed) AS trajectory_alignment_r FROM joiner;

-- Safe unschedule and reschedule cron jobs
DO $$ BEGIN PERFORM cron.unschedule('mv_kpi_fast_10min'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('mv_kpi_timing_30min'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('mv_kpi_discrimination_hourly'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('mv_kpi_comprehensive_hourly'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule('mv_kpi_fast_10min', '*/10 * * * *', $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_engagement;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_item_flow;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_item_clarity;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_response_process;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_user_experience;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_business;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_sessions;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_item_flags;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_feedback;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_scoring;
$$);

SELECT cron.schedule('mv_kpi_comprehensive_hourly', '5 * * * *', $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_reliability_alpha;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_reliability_split_half;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_reliability;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_item_discrimination;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_cfa;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_construct_coverage;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_fairness_dif;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_calibration;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_classification_stability;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_confidence_spread;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_followup;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_behavioral_impact;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_trajectory_alignment;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_item_timing;
$$);