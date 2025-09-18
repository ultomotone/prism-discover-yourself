-- Schema refinements for production-ready scoring system

-- 1) FK cleanup & locality (cascade + PK order)
-- Better locality (session_id first) + CASCADE
ALTER TABLE public.scoring_results_functions
  DROP CONSTRAINT IF EXISTS scoring_results_functions_pkey CASCADE;
ALTER TABLE public.scoring_results_functions
  ADD PRIMARY KEY (session_id, results_version, func);

ALTER TABLE public.scoring_results_functions
  DROP CONSTRAINT IF EXISTS scoring_results_functions_session_id_fkey CASCADE;
ALTER TABLE public.scoring_results_functions
  ADD CONSTRAINT scoring_results_functions_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES public.assessment_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.scoring_results_types
  DROP CONSTRAINT IF EXISTS scoring_results_types_pkey CASCADE;
ALTER TABLE public.scoring_results_types
  ADD PRIMARY KEY (session_id, results_version, type_code);

ALTER TABLE public.scoring_results_types
  DROP CONSTRAINT IF EXISTS scoring_results_types_session_id_fkey CASCADE;
ALTER TABLE public.scoring_results_types
  ADD CONSTRAINT scoring_results_types_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES public.assessment_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.scoring_results_state
  DROP CONSTRAINT IF EXISTS scoring_results_state_pkey CASCADE;
ALTER TABLE public.scoring_results_state
  ADD PRIMARY KEY (session_id, results_version, block_context);

ALTER TABLE public.scoring_results_state
  DROP CONSTRAINT IF EXISTS scoring_results_state_session_id_fkey CASCADE;
ALTER TABLE public.scoring_results_state
  ADD CONSTRAINT scoring_results_state_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES public.assessment_sessions(id) ON DELETE CASCADE;

-- 2) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scoring_results_types_session_version 
  ON public.scoring_results_types (session_id, results_version);
  
CREATE INDEX IF NOT EXISTS idx_scoring_results_functions_session_version 
  ON public.scoring_results_functions (session_id, results_version);
  
CREATE INDEX IF NOT EXISTS idx_scoring_results_state_session_version 
  ON public.scoring_results_state (session_id, results_version);

CREATE INDEX IF NOT EXISTS idx_scoring_results_types_share_desc 
  ON public.scoring_results_types (session_id, results_version, share DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_created_at 
  ON public.assessment_sessions (created_at);

-- 3) Numeric precision (prevent float drift)
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
-- Check if constraint exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'scoring_results_unique_per_version'
        AND table_name = 'scoring_results'
    ) THEN
        ALTER TABLE public.scoring_results
        ADD CONSTRAINT scoring_results_unique_per_version
        UNIQUE (session_id, results_version);
    END IF;
END $$;