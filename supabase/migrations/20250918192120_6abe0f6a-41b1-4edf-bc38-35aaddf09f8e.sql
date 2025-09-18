-- Create enhanced scoring results tables to replace placeholder data

-- Per-type scoring results (distance, share, fit, seat metrics)
CREATE TABLE public.scoring_results_types (
  session_id uuid NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  results_version text NOT NULL DEFAULT 'v2',
  calibration_version text,
  type_code text NOT NULL CHECK (type_code = ANY (ARRAY[
    'LIE','ILI','ESE','SEI','LII','ILE','ESI','SEE','LSE','SLI','EIE','IEI','LSI','SLE','EII','IEE'
  ])),
  distance numeric NOT NULL,
  share numeric NOT NULL CHECK (share >= 0 AND share <= 100),
  fit numeric NOT NULL CHECK (fit >= 0 AND fit <= 100),
  seat_coherence numeric CHECK (seat_coherence >= 0 AND seat_coherence <= 1),
  coherent_dims numeric,
  unique_dims numeric,
  fit_parts jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, results_version, type_code)
);

-- Per-function scoring results (strengths, dimensions)
CREATE TABLE public.scoring_results_functions (
  session_id uuid NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  results_version text NOT NULL DEFAULT 'v2',
  func text NOT NULL CHECK (func = ANY (ARRAY['Ti','Te','Fi','Fe','Ni','Ne','Si','Se'])),
  strength_z numeric NOT NULL,
  dimension smallint NOT NULL CHECK (dimension BETWEEN 1 AND 4),
  d_index_z numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, results_version, func)
);

-- State and overlay effects (blocks, overlay impact)
CREATE TABLE public.scoring_results_state (
  session_id uuid NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  results_version text NOT NULL DEFAULT 'v2',
  overlay_band text NOT NULL CHECK (overlay_band IN ('Reg+','Reg0','Reg-')),
  overlay_z numeric,
  effect_fit numeric,
  effect_conf numeric,
  block_core numeric,
  block_critic numeric, 
  block_hidden numeric,
  block_instinct numeric,
  block_context text DEFAULT 'calm' CHECK (block_context IN ('calm','stress','flow')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, results_version, block_context)
);

-- Update existing scoring_results table to use numeric confidence
ALTER TABLE public.scoring_results 
ALTER COLUMN confidence TYPE numeric USING (
  CASE 
    WHEN confidence = 'High' THEN 0.8
    WHEN confidence = 'Moderate' THEN 0.5
    WHEN confidence = 'Low' THEN 0.2
    ELSE 0.0
  END
);

-- Add calibration_version tracking
ALTER TABLE public.scoring_results ADD COLUMN IF NOT EXISTS calibration_version text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS calibration_version text;

-- Create views for UI access
CREATE VIEW public.v_results_types AS 
SELECT * FROM public.scoring_results_types;

CREATE VIEW public.v_results_functions AS 
SELECT * FROM public.scoring_results_functions;

CREATE VIEW public.v_results_state AS 
SELECT * FROM public.scoring_results_state;

-- Create indexes for performance
CREATE INDEX idx_scoring_results_types_session ON public.scoring_results_types(session_id);
CREATE INDEX idx_scoring_results_functions_session ON public.scoring_results_functions(session_id);
CREATE INDEX idx_scoring_results_state_session ON public.scoring_results_state(session_id);

-- RLS policies
ALTER TABLE public.scoring_results_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results_state ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can manage scoring_results_types" ON public.scoring_results_types
FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage scoring_results_functions" ON public.scoring_results_functions  
FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage scoring_results_state" ON public.scoring_results_state
FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Allow users to read their own results
CREATE POLICY "Users can read their scoring_results_types" ON public.scoring_results_types
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.assessment_sessions s 
    WHERE s.id = session_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read their scoring_results_functions" ON public.scoring_results_functions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.assessment_sessions s 
    WHERE s.id = session_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read their scoring_results_state" ON public.scoring_results_state
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.assessment_sessions s 
    WHERE s.id = session_id AND s.user_id = auth.uid()
  )
);

-- QA check functions
CREATE OR REPLACE FUNCTION public.check_scoring_qa(p_session_id uuid, p_results_version text DEFAULT 'v2')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  share_sum numeric;
  share_stddev numeric;
  fit_min numeric;
  fit_max numeric;
  top2_gap_check numeric;
  result jsonb := '{}';
BEGIN
  -- Check shares sum to 100
  SELECT SUM(share), STDDEV(share) 
  INTO share_sum, share_stddev
  FROM public.scoring_results_types 
  WHERE session_id = p_session_id AND results_version = p_results_version;
  
  -- Check fit variance  
  SELECT MIN(fit), MAX(fit)
  INTO fit_min, fit_max
  FROM public.scoring_results_types
  WHERE session_id = p_session_id AND results_version = p_results_version;
  
  result := jsonb_build_object(
    'share_sum', COALESCE(share_sum, 0),
    'share_sum_ok', ABS(COALESCE(share_sum, 0) - 100.0) < 0.01,
    'share_stddev', COALESCE(share_stddev, 0), 
    'share_variance_ok', COALESCE(share_stddev, 0) > 0.5,
    'fit_min', COALESCE(fit_min, 0),
    'fit_max', COALESCE(fit_max, 0),
    'fit_variance_ok', COALESCE(fit_max, 0) > COALESCE(fit_min, 0)
  );
  
  RETURN result;
END;
$$;