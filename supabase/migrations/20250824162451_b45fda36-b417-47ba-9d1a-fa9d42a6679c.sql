-- ============================================
-- PRISM Assessment Security and Scoring Audit - Fixed
-- ============================================

-- Step 1: Fix RLS Policies for Better Security
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous dashboard access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can update profiles for backfill" ON public.profiles;

-- Create secure profile access policies
CREATE POLICY "Users can view their own profiles" ON public.profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profiles" ON public.profiles  
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profiles" ON public.profiles
FOR UPDATE USING (user_id = auth.uid());

-- Allow service role to access profiles for scoring
CREATE POLICY "Service role can manage profiles" ON public.profiles
FOR ALL USING (auth.role() = 'service_role'::text);

-- Create public dashboard view that only shows aggregated, anonymized data
CREATE OR REPLACE VIEW public.dashboard_profile_stats AS
SELECT 
  type_code,
  overlay,
  confidence,
  fit_band,
  DATE(created_at) as assessment_date,
  COUNT(*) as count
FROM profiles 
WHERE type_code IS NOT NULL 
GROUP BY type_code, overlay, confidence, fit_band, DATE(created_at);

-- Grant public access to dashboard stats only
GRANT SELECT ON public.dashboard_profile_stats TO anon, authenticated;

-- Step 2: Fix Assessment Responses RLS
-- Drop and recreate response policies
DROP POLICY IF EXISTS "Only owner can read responses" ON public.assessment_responses;
DROP POLICY IF EXISTS "Users can view their session responses" ON public.assessment_responses;

CREATE POLICY "Users can view their session responses" ON public.assessment_responses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM assessment_sessions s 
    WHERE s.id = assessment_responses.session_id 
    AND s.user_id = auth.uid()
  )
);

-- Allow service role access for scoring
CREATE POLICY "Service role can access responses for scoring" ON public.assessment_responses
FOR SELECT USING (auth.role() = 'service_role'::text);

-- Step 3: Create calculate_scores function
CREATE OR REPLACE FUNCTION public.calculate_scores(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  scores jsonb := '{}';
  dimension_scores jsonb := '{}';
  fc_scores jsonb := '{}';
  likert_scores jsonb := '{}';
  response_count integer;
BEGIN
  -- Check if session exists and has responses
  SELECT COUNT(*) INTO response_count 
  FROM assessment_responses ar
  JOIN assessment_sessions s ON s.id = ar.session_id
  WHERE ar.session_id = p_session_id;

  IF response_count = 0 THEN
    RETURN jsonb_build_object('error', 'No responses found for session');
  END IF;

  -- Calculate Forced Choice scores
  WITH fc_responses AS (
    SELECT 
      ar.session_id,
      ar.question_id,
      ar.answer_value,
      ask.fc_map
    FROM assessment_responses ar
    JOIN assessment_scoring_key ask ON ar.question_id = ask.question_id
    WHERE ar.session_id = p_session_id
    AND ask.fc_map IS NOT NULL
    AND ar.answer_value IS NOT NULL
  ),
  fc_dimension_scores AS (
    SELECT 
      dimension,
      COUNT(*) as score
    FROM fc_responses,
    LATERAL jsonb_each_text(fc_map) AS mapping(option_key, dimension)
    WHERE mapping.option_key = fc_responses.answer_value
    GROUP BY dimension
  )
  SELECT jsonb_object_agg(dimension, score) INTO fc_scores
  FROM fc_dimension_scores;

  -- Calculate Likert scores (average by dimension)
  WITH likert_responses AS (
    SELECT 
      ar.session_id,
      ar.question_id,
      ar.answer_numeric,
      ask.tag,
      ask.reverse_scored
    FROM assessment_responses ar
    JOIN assessment_scoring_key ask ON ar.question_id = ask.question_id
    WHERE ar.session_id = p_session_id
    AND ask.tag IS NOT NULL
    AND ar.answer_numeric IS NOT NULL
    AND ask.scale_type::text IN ('likert_5', 'likert_7')
  ),
  normalized_scores AS (
    SELECT 
      tag,
      CASE 
        WHEN reverse_scored THEN 6 - answer_numeric  -- Reverse 1-5 scale
        ELSE answer_numeric
      END as normalized_score
    FROM likert_responses
  ),
  likert_dimension_scores AS (
    SELECT 
      tag as dimension,
      ROUND(AVG(normalized_score), 2) as avg_score
    FROM normalized_scores
    GROUP BY tag
  )
  SELECT jsonb_object_agg(dimension, avg_score) INTO likert_scores
  FROM likert_dimension_scores;

  -- Combine scores - ensure all cognitive functions are represented
  dimension_scores := COALESCE(fc_scores, '{}'::jsonb) || COALESCE(likert_scores, '{}'::jsonb);

  -- Ensure minimum scores to prevent zeros
  IF jsonb_typeof(dimension_scores) = 'object' THEN
    -- Add default scores for missing functions
    SELECT jsonb_object_agg(func, COALESCE((dimension_scores->>func)::numeric, 1))
    INTO dimension_scores
    FROM (VALUES 
      ('Te'), ('Ti'), ('Fe'), ('Fi'), 
      ('Ne'), ('Ni'), ('Se'), ('Si')
    ) AS functions(func);
  END IF;

  -- Build final result
  scores := jsonb_build_object(
    'session_id', p_session_id,
    'dimension_scores', dimension_scores,
    'forced_choice_scores', COALESCE(fc_scores, '{}'::jsonb),
    'likert_scores', COALESCE(likert_scores, '{}'::jsonb),
    'response_count', response_count,
    'calculated_at', now()
  );

  RETURN scores;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'session_id', p_session_id,
      'calculated_at', now()
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.calculate_scores(uuid) TO authenticated, service_role;

-- Step 4: Create user-safe scoring function
CREATE OR REPLACE FUNCTION public.get_user_assessment_scores(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  session_user_id uuid;
BEGIN
  -- Check if the session belongs to the current user
  SELECT user_id INTO session_user_id 
  FROM assessment_sessions 
  WHERE id = p_session_id;
  
  IF session_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Session not found or anonymous');
  END IF;
  
  IF session_user_id != auth.uid() THEN
    RETURN jsonb_build_object('error', 'Access denied: not your session');
  END IF;
  
  -- Calculate and return scores
  RETURN public.calculate_scores(p_session_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_assessment_scores(uuid) TO authenticated;