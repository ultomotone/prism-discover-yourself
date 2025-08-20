-- Create assessment_landscape view adapted to current schema (profiles + assessment_sessions)
CREATE OR REPLACE VIEW public.assessment_landscape AS
SELECT
  p.id AS assessment_id,
  p.session_id,
  p.user_id AS respondent_id,
  p.submitted_at,
  p.created_at,
  p.type_code,
  p.overlay,
  p.score_fit_calibrated AS fit_abs,
  p.confidence,
  p.top_gap,
  ROUND(EXTRACT(EPOCH FROM (COALESCE(p.submitted_at, s.completed_at) - s.started_at)) / 60.0, 2) AS duration_minutes,
  (p.validity_status = 'pass') AS validity_pass,
  (p.validity->>'inconsistency')::numeric AS inconsistency_score,
  (p.validity->>'sd_index')::numeric AS sd_score,
  (p.validity->'state_modifiers'->>'stress')::numeric AS state_stress,
  (p.validity->'state_modifiers'->>'sleep')::numeric AS state_sleep,
  (p.validity->'state_modifiers'->>'time')::numeric AS state_time_pressure,
  NULL::numeric AS state_mood,
  (p.validity->'state_modifiers'->>'focus')::numeric AS state_focus,
  -- stalled if duration exceeds 60 minutes (config key optional, default 60)
  CASE
    WHEN ROUND(EXTRACT(EPOCH FROM (COALESCE(p.submitted_at, s.completed_at) - s.started_at)) / 60.0, 2) > 60
    THEN true ELSE false END AS stalled,
  -- numeric confidence margin from share_pct difference between top1 and top2
  (
    (p.type_scores->(p.top_types->>0)->>'share_pct')::numeric -
    COALESCE((p.type_scores->(p.top_types->>1)->>'share_pct')::numeric, 0)
  ) AS confidence_margin,
  CASE
    WHEN (
      (p.type_scores->(p.top_types->>0)->>'share_pct')::numeric -
      COALESCE((p.type_scores->(p.top_types->>1)->>'share_pct')::numeric, 0)
    ) >= 30 THEN 'High'
    WHEN (
      (p.type_scores->(p.top_types->>0)->>'share_pct')::numeric -
      COALESCE((p.type_scores->(p.top_types->>1)->>'share_pct')::numeric, 0)
    ) >= 15 THEN 'Moderate'
    ELSE 'Low'
  END AS confidence_band
FROM public.profiles p
LEFT JOIN public.assessment_sessions s ON s.id = p.session_id;

-- Upsert recommended scoring/config keys (stored as JSONB)
INSERT INTO public.scoring_config (key, value, updated_at) VALUES
  ('flag_duration_threshold_minutes', '60'::jsonb, now()),
  ('min_fit_abs_for_typing', '60'::jsonb, now()),
  ('min_top_gap_for_high_conf', '1.5'::jsonb, now()),
  ('fit_bands', '{
    "low": {"fit_max": 44, "gap_max": 2},
    "moderate": {"fit_min": 45, "fit_max": 59, "gap_min": 2, "gap_max": 4},
    "high": {"fit_min": 60, "gap_min": 5}
  }'::jsonb, now())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      updated_at = now();