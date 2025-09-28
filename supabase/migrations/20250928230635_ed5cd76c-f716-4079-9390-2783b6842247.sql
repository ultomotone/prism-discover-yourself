-- Phase 1: Stabilize with minimal cache tables (handle existing objects)
-- These are NOT source of truth - only convenience for fast reads and backward compatibility

-- Drop and recreate profiles table if needed
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Core profile cache (one row per session) 
CREATE TABLE public.profiles (
  session_id uuid PRIMARY KEY,
  type_code text,
  confidence numeric,
  payload jsonb NOT NULL,            -- full stateless payload (types, functions, state, etc.)
  scoring_version text NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now(),
  
  -- Additional fields for compatibility with existing UI
  id uuid DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  share_token text,
  results_version text,
  version text,
  overlay text,
  conf_calibrated numeric,
  score_fit_calibrated numeric,
  top_types jsonb,
  fit_band text,
  validity_status text,
  top_gap numeric,
  conf_raw numeric
);

-- Drop and recreate exploded tables if they exist
DROP TABLE IF EXISTS public.scoring_results_types CASCADE;
DROP TABLE IF EXISTS public.scoring_results_functions CASCADE;
DROP TABLE IF EXISTS public.scoring_results_state CASCADE;

-- Optional exploded tables for UI compatibility (redundant with payload)
CREATE TABLE public.scoring_results_types (
  session_id uuid REFERENCES public.profiles(session_id) ON DELETE CASCADE,
  type_code text NOT NULL,
  fit numeric,
  share numeric,
  rank int,
  results_version text NOT NULL DEFAULT 'v1.2.1',
  distance numeric,
  coherent_dims integer,
  unique_dims integer,
  seat_coherence numeric,
  fit_parts jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (session_id, type_code, results_version)
);

CREATE TABLE public.scoring_results_functions (
  session_id uuid REFERENCES public.profiles(session_id) ON DELETE CASCADE,
  func text NOT NULL,   -- Ti/Te/Fi/Fe/Ni/Ne/Si/Se
  strength_z numeric,
  dimension integer,   -- 1-4
  results_version text NOT NULL DEFAULT 'v1.2.1',
  d_index_z numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (session_id, func, results_version)
);

CREATE TABLE public.scoring_results_state (
  session_id uuid REFERENCES public.profiles(session_id) ON DELETE CASCADE,
  results_version text NOT NULL DEFAULT 'v1.2.1',
  block_context text NOT NULL DEFAULT 'calm',
  overlay_band text,
  overlay_z numeric,
  effect_fit numeric,
  effect_conf numeric,
  block_core numeric,
  block_critic numeric,
  block_hidden numeric,
  block_instinct numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (session_id, results_version, block_context)
);

-- Ensure scoring_config table exists with basic values
DELETE FROM public.scoring_config;
INSERT INTO public.scoring_config (key, value, updated_at) VALUES
  ('results_version', '"v1.2.1"', now()),
  ('softmax_temp', '1.0', now()),
  ('fc_expected_min', '24', now());

-- Grant permissions on new tables
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.scoring_results_types TO anon, authenticated;  
GRANT ALL ON public.scoring_results_functions TO anon, authenticated;
GRANT ALL ON public.scoring_results_state TO anon, authenticated;

-- RLS policies (permissive for now as requested)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_scoring_results_types" ON public.scoring_results_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_scoring_results_functions" ON public.scoring_results_functions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_scoring_results_state" ON public.scoring_results_state FOR ALL USING (true) WITH CHECK (true);

-- Create get_results_v2 RPC function that tries cache first, computes if missing
CREATE OR REPLACE FUNCTION public.get_results_v2(session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cached_payload jsonb;
BEGIN
  -- Try to get from cache first
  SELECT payload INTO cached_payload
  FROM public.profiles 
  WHERE profiles.session_id = get_results_v2.session_id
  AND computed_at > now() - interval '1 hour'; -- Consider cache valid for 1 hour
  
  IF cached_payload IS NOT NULL THEN
    -- Return cached result
    RETURN jsonb_build_object(
      'ok', true,
      'source', 'cache',
      'profile', cached_payload->'profile',
      'types', cached_payload->'types',
      'functions', cached_payload->'functions', 
      'state', cached_payload->'state',
      'session', cached_payload->'session',
      'results_version', cached_payload->>'results_version',
      'result_id', session_id
    );
  END IF;
  
  -- Cache miss - need to compute (this will be handled by score_prism edge function)
  RETURN jsonb_build_object(
    'ok', false,
    'code', 'SCORING_ROWS_MISSING',
    'message', 'Results not cached, need to compute via score_prism'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', SQLERRM,
      'code', 'INTERNAL_ERROR'
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_results_v2(uuid) TO anon, authenticated;

-- Add indexes for performance
CREATE INDEX idx_profiles_session_id ON public.profiles(session_id);
CREATE INDEX idx_profiles_computed_at ON public.profiles(computed_at);
CREATE INDEX idx_scoring_results_types_session ON public.scoring_results_types(session_id);
CREATE INDEX idx_scoring_results_functions_session ON public.scoring_results_functions(session_id);
CREATE INDEX idx_scoring_results_state_session ON public.scoring_results_state(session_id);