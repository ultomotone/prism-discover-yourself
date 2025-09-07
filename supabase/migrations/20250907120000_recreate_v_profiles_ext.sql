-- up
DROP VIEW IF EXISTS public.v_profiles_ext;

CREATE VIEW public.v_profiles_ext AS
SELECT
  p.id,
  p.user_id,
  p.session_id,
  p.type_code,
  p.base_func,
  p.creative_func,
  p.overlay,
  p.strengths,
  p.dimensions,
  p.blocks,
  p.neuroticism,
  p.validity,
  p.confidence,
  p.type_scores,
  p.top_types,
  p.dims_highlights,
  p.glossary_version,
  p.created_at,
  p.updated_at,
  p.blocks_norm,
  p.version,
  p.person_key,
  p.email_mask,
  p.run_index,
  p.prev_session_id,
  p.baseline_session_id,
  p.deltas,
  p.session_kind,
  p.parent_session_id,
  p.gap_minutes,
  p.ip_hash,
  p.ua_hash,
  p.validity_status,
  p.top_gap,
  p.close_call,
  p.fit_band,
  p.fc_answered_ct,
  p.top_3_fits,
  p.fit_explainer,
  p.fc_count,
  p.fc_coverage_bucket,
  p.results_version,
  p.score_fit_raw,
  p.score_fit_calibrated,
  p.invalid_combo_flag,
  p.neuro_mean,
  p.neuro_z,
  p.overlay_neuro,
  p.overlay_state,
  p.state_index,
  p.trait_scores,
  p.submitted_at,
  p.recomputed_at,
  p.conf_raw,
  p.conf_calibrated,
  p.conf_band,
  coalesce(p.overlay_neuro, p.overlay) AS overlay_compat,
  (SELECT (value->>'fit_abs')::numeric
     FROM jsonb_each(p.type_scores)
     ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST
     LIMIT 1) AS top1_fit,
  (SELECT (value->>'fit_abs')::numeric
     FROM jsonb_each(p.type_scores)
     ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST
     OFFSET 1 LIMIT 1) AS top2_fit,
  (SELECT (value->>'share_pct')::numeric
     FROM jsonb_each(p.type_scores)
     ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST
     LIMIT 1) AS top1_share,
  (SELECT key
     FROM jsonb_each(p.type_scores)
     ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST
     LIMIT 1) AS top_type
FROM public.profiles p;

GRANT SELECT ON public.v_profiles_ext TO anon, authenticated;

-- down
DROP VIEW IF EXISTS public.v_profiles_ext;

CREATE VIEW public.v_profiles_ext AS
SELECT
  p.*,
  coalesce(p.overlay_neuro, p.overlay) AS overlay_compat
FROM public.profiles p;

GRANT SELECT ON public.v_profiles_ext TO anon, authenticated;
