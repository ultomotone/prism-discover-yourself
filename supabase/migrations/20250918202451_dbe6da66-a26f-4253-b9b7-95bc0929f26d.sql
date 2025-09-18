-- PR1: Create RPC for v2 results payload
CREATE OR REPLACE FUNCTION public.get_results_v2(p_session_id uuid, p_share_token text DEFAULT NULL)
RETURNS TABLE (
  session jsonb, 
  profile jsonb, 
  types jsonb, 
  functions jsonb, 
  state jsonb
) 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE 
  v_session public.assessment_sessions;
BEGIN
  -- Get session and validate access
  SELECT * INTO v_session FROM public.assessment_sessions WHERE id = p_session_id;
  IF NOT FOUND THEN 
    RAISE EXCEPTION 'session_not_found' USING ERRCODE = '42501';
  END IF;
  
  -- Check share token if provided
  IF p_share_token IS NOT NULL AND v_session.share_token <> p_share_token THEN
    RAISE EXCEPTION 'invalid_share_token' USING ERRCODE = '42501';
  END IF;

  -- Return aggregated results
  RETURN QUERY
  SELECT 
    to_jsonb(v_session) AS session,
    (SELECT to_jsonb(p) FROM public.profiles p WHERE p.session_id = p_session_id) AS profile,
    COALESCE((
      SELECT jsonb_agg(t ORDER BY t.share DESC) FROM (
        SELECT type_code, share, fit, distance, coherent_dims, unique_dims, seat_coherence, fit_parts
        FROM public.scoring_results_types
        WHERE session_id = p_session_id AND results_version = 'v2'
      ) t
    ), '[]'::jsonb) AS types,
    COALESCE((
      SELECT jsonb_agg(f ORDER BY f.func) FROM (
        SELECT func, strength_z, dimension, d_index_z
        FROM public.scoring_results_functions
        WHERE session_id = p_session_id AND results_version = 'v2'
      ) f
    ), '[]'::jsonb) AS functions,
    COALESCE((
      SELECT jsonb_agg(s) FROM (
        SELECT overlay_band, overlay_z, effect_fit, effect_conf,
               block_core, block_critic, block_hidden, block_instinct, block_context
        FROM public.scoring_results_state
        WHERE session_id = p_session_id AND results_version = 'v2'
      ) s
    ), '[]'::jsonb) AS state;
END
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_results_v2(uuid, text) TO anon, authenticated;

-- PR2: Create unique indexes for idempotent upserts
CREATE UNIQUE INDEX IF NOT EXISTS srt_unique
  ON public.scoring_results_types (session_id, results_version, type_code);

CREATE UNIQUE INDEX IF NOT EXISTS srf_unique
  ON public.scoring_results_functions (session_id, results_version, func);

-- Add unique constraint for state table if needed
-- (assuming overlay_band + block_context as natural key)
CREATE UNIQUE INDEX IF NOT EXISTS srs_unique
  ON public.scoring_results_state (session_id, results_version);

-- PR4: Create session linking RPC with conflict handling
CREATE OR REPLACE FUNCTION public.link_session_to_user(
  p_session uuid, 
  p_user uuid, 
  p_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE 
  updated int;
BEGIN
  -- Try to link session (only if unlinked or already linked to same user)
  UPDATE public.assessment_sessions
  SET user_id = p_user,
      email = COALESCE(p_email, email),
      updated_at = now()
  WHERE id = p_session
    AND (user_id IS NULL OR user_id = p_user);
  
  GET DIAGNOSTICS updated = ROW_COUNT;
  
  IF updated = 1 THEN 
    RETURN jsonb_build_object('status', 'linked');
  END IF;
  
  -- Check if session exists but is linked to different user
  IF EXISTS(SELECT 1 FROM public.assessment_sessions WHERE id = p_session) THEN
    RETURN jsonb_build_object('status', 'conflict');
  END IF;
  
  RETURN jsonb_build_object('status', 'not_found');
END
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.link_session_to_user(uuid, uuid, text) TO authenticated;