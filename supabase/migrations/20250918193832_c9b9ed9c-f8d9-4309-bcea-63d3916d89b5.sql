-- Schema refinements for production-ready scoring system

-- 1) FK cleanup & locality (cascade + PK order)
-- Better locality (session_id first) + CASCADE
ALTER TABLE public.scoring_results_functions
  DROP CONSTRAINT IF EXISTS scoring_results_functions_pkey,
  ADD  PRIMARY KEY (session_id, results_version, func);

ALTER TABLE public.scoring_results_functions
  DROP CONSTRAINT IF EXISTS scoring_results_functions_session_id_fkey,
  ADD  CONSTRAINT scoring_results_functions_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES public.assessment_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.scoring_results_types
  DROP CONSTRAINT IF EXISTS scoring_results_types_pkey,
  ADD  PRIMARY KEY (session_id, results_version, type_code);

ALTER TABLE public.scoring_results_types
  DROP CONSTRAINT IF EXISTS scoring_results_types_session_id_fkey,
  ADD  CONSTRAINT scoring_results_types_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES public.assessment_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.scoring_results_state
  DROP CONSTRAINT IF EXISTS scoring_results_state_pkey,
  ADD  PRIMARY KEY (session_id, results_version, block_context);

ALTER TABLE public.scoring_results_state
  DROP CONSTRAINT IF EXISTS scoring_results_state_session_id_fkey,
  ADD  CONSTRAINT scoring_results_state_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES public.assessment_sessions(id) ON DELETE CASCADE;

-- 2) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scoring_results_types_session_version 
  ON public.scoring_results_types (session_id, results_version);
  
CREATE INDEX IF NOT EXISTS idx_scoring_results_functions_session_version 
  ON public.scoring_results_functions (session_id, results_version);
  
CREATE INDEX IF NOT EXISTS idx_scoring_results_state_session_version 
  ON public.scoring_results_state (session_id, results_version);

-- For "show top types" queries:
CREATE INDEX IF NOT EXISTS idx_scoring_results_types_share_desc 
  ON public.scoring_results_types (session_id, results_version, share DESC);

-- For admin/time-windowed backfills:
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_created_at 
  ON public.assessment_sessions (created_at);

-- 3) Numeric precision (prevent float drift, keep UI rounding only)
ALTER TABLE public.scoring_results_types
  ALTER COLUMN share TYPE numeric(7,4),
  ALTER COLUMN fit   TYPE numeric(7,4),
  ALTER COLUMN distance TYPE numeric(10,6),
  ALTER COLUMN seat_coherence TYPE numeric(7,6);

ALTER TABLE public.scoring_results_functions
  ALTER COLUMN strength_z TYPE numeric(8,5),
  ALTER COLUMN d_index_z  TYPE numeric(8,5);

ALTER TABLE public.scoring_results_state
  ALTER COLUMN overlay_z  TYPE numeric(8,5),
  ALTER COLUMN effect_fit TYPE numeric(8,5),
  ALTER COLUMN effect_conf TYPE numeric(8,5);

ALTER TABLE public.scoring_results
  ALTER COLUMN score_fit_calibrated TYPE numeric(7,4),
  ALTER COLUMN confidence           TYPE numeric(7,5);

-- 5) One summary row per session/version (avoid duplicates)
ALTER TABLE public.scoring_results
  ADD CONSTRAINT IF NOT EXISTS scoring_results_unique_per_version
  UNIQUE (session_id, results_version);

-- 6) Views for the frontend (simple, stable API)
CREATE OR REPLACE VIEW public.v_results_types AS
  SELECT session_id, results_version, type_code, share, fit, distance,
         seat_coherence, coherent_dims, unique_dims, fit_parts, created_at
  FROM public.scoring_results_types;

CREATE OR REPLACE VIEW public.v_results_functions AS
  SELECT session_id, results_version, func, strength_z, dimension, d_index_z, created_at
  FROM public.scoring_results_functions;

CREATE OR REPLACE VIEW public.v_results_state AS
  SELECT session_id, results_version, overlay_band, overlay_z, effect_fit, effect_conf,
         block_core, block_critic, block_hidden, block_instinct, block_context, created_at
  FROM public.scoring_results_state;

-- Grant access to views
GRANT SELECT ON public.v_results_types TO authenticated, anon;
GRANT SELECT ON public.v_results_functions TO authenticated, anon;
GRANT SELECT ON public.v_results_state TO authenticated, anon;