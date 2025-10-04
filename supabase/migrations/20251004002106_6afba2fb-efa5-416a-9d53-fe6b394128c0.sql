-- === STATE Overlay Analytics Schema ===
-- Single-item measures (STATE_STRESS, STATE_MOOD, etc.) for contextual overlays

-- === STATE items mapping ===
CREATE OR REPLACE VIEW public.v_state_items AS
SELECT
  sk.tag AS state_tag,
  sk.question_id,
  COALESCE(q.required, true) AS is_active
FROM public.assessment_scoring_key sk
JOIN public.assessment_questions q ON q.id = sk.question_id
WHERE sk.tag IN ('STATE_STRESS','STATE_MOOD','STATE_SLEEP','STATE_FOCUS','STATE_TIME')
  AND sk.scale_type = 'STATE_1_7';

-- === STATE responses (parse from answer_numeric or answer_value) ===
CREATE OR REPLACE VIEW public.v_state_responses AS
SELECT
  r.session_id,
  vsi.state_tag,
  COALESCE(
    NULLIF(r.answer_numeric, 0),
    NULLIF((regexp_match(COALESCE(r.answer_value,''), '([1-7])'))[1], '')::int
  )::numeric AS x_1_7,
  r.created_at
FROM public.assessment_responses r
JOIN public.v_state_items vsi ON vsi.question_id = r.question_id
WHERE COALESCE(
        COALESCE(r.answer_numeric, NULLIF((regexp_match(COALESCE(r.answer_value,''), '([1-7])'))[1], '')::int),
        0
      ) BETWEEN 1 AND 7;

-- === One row per session with 5 STATE components ===
CREATE OR REPLACE VIEW public.v_state_session AS
SELECT
  session_id,
  MAX(x_1_7) FILTER (WHERE state_tag='STATE_STRESS') AS stress_1_7,
  MAX(x_1_7) FILTER (WHERE state_tag='STATE_MOOD')   AS mood_1_7,
  MAX(x_1_7) FILTER (WHERE state_tag='STATE_SLEEP')  AS sleep_1_7,
  MAX(x_1_7) FILTER (WHERE state_tag='STATE_FOCUS')  AS focus_1_7,
  MAX(x_1_7) FILTER (WHERE state_tag='STATE_TIME')   AS time_1_7
FROM public.v_state_responses
GROUP BY session_id;

-- === Weighted state index (stress:1.5, mood:1.2, sleep:1.0, focus:0.8, time:0.8) ===
CREATE OR REPLACE VIEW public.v_state_index AS
WITH w AS (
  SELECT
    session_id,
    stress_1_7, mood_1_7, sleep_1_7, focus_1_7, time_1_7,
    (CASE WHEN stress_1_7 IS NOT NULL THEN 1.5 ELSE 0 END) +
    (CASE WHEN mood_1_7   IS NOT NULL THEN 1.2 ELSE 0 END) +
    (CASE WHEN sleep_1_7  IS NOT NULL THEN 1.0 ELSE 0 END) +
    (CASE WHEN focus_1_7  IS NOT NULL THEN 0.8 ELSE 0 END) +
    (CASE WHEN time_1_7   IS NOT NULL THEN 0.8 ELSE 0 END) AS w_sum,
    (COALESCE(stress_1_7,0)*1.5 +
     COALESCE(mood_1_7,0)*1.2   +
     COALESCE(sleep_1_7,0)*1.0  +
     COALESCE(focus_1_7,0)*0.8  +
     COALESCE(time_1_7,0)*0.8) AS w_num
  FROM public.v_state_session
)
SELECT
  session_id,
  COALESCE(NULLIF(w_num,0) / NULLIF(w_sum,0), 3.5) AS state_index_1_7
FROM w;

-- === Overlay class from index (N+: ≥5.5, N-: ≤2.5, N0: middle) ===
CREATE OR REPLACE VIEW public.v_state_overlay AS
SELECT
  s.session_id,
  s.state_index_1_7,
  CASE
    WHEN s.state_index_1_7 >= 5.5 THEN 'N+'
    WHEN s.state_index_1_7 <= 2.5 THEN 'N-'
    ELSE 'N0'
  END AS overlay_state
FROM public.v_state_index s;

-- === Helper: per-session Neuroticism (for state-trait separation) ===
CREATE OR REPLACE VIEW public.v_neuro_per_session AS
WITH n_items AS (
  SELECT sk.question_id
  FROM public.assessment_scoring_key sk
  WHERE sk.tag = 'N' AND sk.scale_type != 'META'
),
resp AS (
  SELECT r.session_id,
         r.question_id,
         r.answer_numeric::numeric AS x
  FROM public.assessment_responses r
  JOIN n_items ni ON ni.question_id = r.question_id
  WHERE r.answer_numeric BETWEEN 1 AND 7
)
SELECT
  session_id,
  AVG(CASE WHEN x BETWEEN 1 AND 7 THEN 1 + (x-1)*(4.0/6.0) ELSE NULL END) AS neuro_1_5
FROM resp
GROUP BY session_id;

-- === DAILY rollup for time filtering ===
DROP MATERIALIZED VIEW IF EXISTS public.mv_state_overlay_daily CASCADE;
CREATE MATERIALIZED VIEW public.mv_state_overlay_daily AS
WITH base AS (
  SELECT
    ses.id AS session_id,
    DATE_TRUNC('day', COALESCE(ses.completed_at, ses.started_at))::date AS day,
    so.overlay_state,
    so.state_index_1_7,
    ss.stress_1_7, ss.mood_1_7, ss.sleep_1_7, ss.focus_1_7, ss.time_1_7
  FROM public.assessment_sessions ses
  LEFT JOIN public.v_state_overlay  so ON so.session_id = ses.id
  LEFT JOIN public.v_state_session  ss ON ss.session_id = ses.id
  WHERE COALESCE(ses.completed_at, ses.started_at) IS NOT NULL
),
traitN AS (
  SELECT session_id, neuro_1_5 FROM public.v_neuro_per_session
),
fit AS (
  SELECT p.session_id,
         p.conf_calibrated::numeric AS conf_calibrated,
         p.top_gap::numeric         AS top_gap
  FROM public.profiles p
)
SELECT
  b.day,
  COUNT(*)::int                                AS n_sessions,
  AVG((b.overlay_state='N+')::int)*100         AS pct_n_plus,
  AVG((b.overlay_state='N0')::int)*100         AS pct_n0,
  AVG((b.overlay_state='N-')::int)*100         AS pct_n_minus,
  AVG(b.stress_1_7)                            AS mean_stress,
  AVG(b.mood_1_7)                              AS mean_mood,
  AVG(b.sleep_1_7)                             AS mean_sleep,
  AVG(b.focus_1_7)                             AS mean_focus,
  AVG(b.time_1_7)                              AS mean_time,
  corr(b.state_index_1_7, tn.neuro_1_5)        AS r_state_traitn,
  AVG(f.conf_calibrated) FILTER (WHERE b.overlay_state='N+') AS conf_mean_nplus,
  AVG(f.conf_calibrated) FILTER (WHERE b.overlay_state='N0') AS conf_mean_n0,
  AVG(f.conf_calibrated) FILTER (WHERE b.overlay_state='N-') AS conf_mean_nminus,
  AVG(f.top_gap)         FILTER (WHERE b.overlay_state='N+') AS topgap_mean_nplus,
  AVG(f.top_gap)         FILTER (WHERE b.overlay_state='N0') AS topgap_mean_n0,
  AVG(f.top_gap)         FILTER (WHERE b.overlay_state='N-') AS topgap_mean_nminus
FROM base b
LEFT JOIN traitN tn ON tn.session_id = b.session_id
LEFT JOIN fit    f  ON f.session_id  = b.session_id
GROUP BY b.day
ORDER BY b.day DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_state_overlay_daily_day ON public.mv_state_overlay_daily(day);

-- === Lifetime KPI (single row aggregate) ===
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_state_overlay CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_state_overlay AS
SELECT
  AVG(pct_n_plus)::numeric  AS pct_n_plus,
  AVG(pct_n0)::numeric      AS pct_n0,
  AVG(pct_n_minus)::numeric AS pct_n_minus,
  AVG(mean_stress)::numeric AS mean_stress,
  AVG(mean_mood)::numeric   AS mean_mood,
  AVG(mean_sleep)::numeric  AS mean_sleep,
  AVG(mean_focus)::numeric  AS mean_focus,
  AVG(mean_time)::numeric   AS mean_time,
  AVG(r_state_traitn)::numeric AS r_state_traitn,
  AVG(conf_mean_nplus)::numeric  AS conf_mean_nplus,
  AVG(conf_mean_n0)::numeric     AS conf_mean_n0,
  AVG(conf_mean_nminus)::numeric AS conf_mean_nminus,
  AVG(topgap_mean_nplus)::numeric  AS topgap_mean_nplus,
  AVG(topgap_mean_n0)::numeric     AS topgap_mean_n0,
  AVG(topgap_mean_nminus)::numeric AS topgap_mean_nminus
FROM public.mv_state_overlay_daily;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_state_overlay_true ON public.mv_kpi_state_overlay ((true));