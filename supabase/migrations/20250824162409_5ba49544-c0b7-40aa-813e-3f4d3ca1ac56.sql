-- ============================================
-- PRISM Assessment Security and Scoring Audit
-- ============================================

-- Step 1: Fix RLS Policies for Better Security
-- Remove the overly permissive anonymous profile access policy
DROP POLICY IF EXISTS "Allow anonymous dashboard access to profiles" ON public.profiles;

-- Create more secure profile access policies
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
-- Ensure responses are properly tied to users
DROP POLICY IF EXISTS "Only owner can read responses" ON public.assessment_responses;

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
  result_record record;
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

  -- Combine scores
  dimension_scores := COALESCE(fc_scores, '{}'::jsonb) || COALESCE(likert_scores, '{}'::jsonb);

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

-- Step 4: Create a user-safe scoring summary function
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

-- Step 5: Update session creation to require user authentication for scoring
-- Add a trigger to ensure user_id is set when authenticated
CREATE OR REPLACE FUNCTION public.ensure_session_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If user is authenticated but user_id is null, set it
  IF auth.uid() IS NOT NULL AND NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply trigger to assessment_sessions
DROP TRIGGER IF EXISTS ensure_session_user_id_trigger ON public.assessment_sessions;
CREATE TRIGGER ensure_session_user_id_trigger
  BEFORE INSERT OR UPDATE ON public.assessment_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_session_user_id();

-- Step 6: Fix scoring configuration consistency
-- Update assessment_questions to have fc_map where scoring_key has it
UPDATE public.assessment_questions 
SET fc_map = ask.fc_map
FROM public.assessment_scoring_key ask
WHERE public.assessment_questions.id = ask.question_id
AND ask.fc_map IS NOT NULL
AND public.assessment_questions.fc_map IS NULL;

-- Add missing scoring_key entries for questions that have fc_map
INSERT INTO public.assessment_scoring_key (
  question_id, tag, scale_type, reverse_scored, fc_map, 
  social_desirability, weight, section, question_type
)
SELECT 
  aq.id,
  aq.tag,
  COALESCE(aq.scale_type::text, 'forced_choice')::assessment_scale_type,
  COALESCE(aq.reverse_scored, false),
  aq.fc_map,
  false,
  1,
  aq.section,
  aq.type
FROM public.assessment_questions aq
LEFT JOIN public.assessment_scoring_key ask ON aq.id = ask.question_id
WHERE aq.fc_map IS NOT NULL 
AND ask.question_id IS NULL;

-- Step 7: Create improved profile creation function
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_session_id uuid,
  p_profile_data jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_id uuid;
  session_user_id uuid;
BEGIN
  -- Get the session's user_id
  SELECT user_id INTO session_user_id 
  FROM assessment_sessions 
  WHERE id = p_session_id;
  
  -- Only allow profile creation for authenticated sessions
  IF session_user_id IS NULL THEN
    RAISE EXCEPTION 'Cannot create profile for anonymous session';
  END IF;
  
  -- Insert profile with proper user association
  INSERT INTO public.profiles (
    session_id,
    user_id,
    type_code,
    overlay,
    confidence,
    strengths,
    dimensions,
    blocks,
    validity,
    type_scores,
    top_types,
    created_at
  )
  VALUES (
    p_session_id,
    session_user_id,
    p_profile_data->>'type_code',
    p_profile_data->>'overlay',
    p_profile_data->>'confidence',
    p_profile_data->'strengths',
    p_profile_data->'dimensions',
    p_profile_data->'blocks',
    p_profile_data->'validity',
    p_profile_data->'type_scores',
    p_profile_data->'top_types',
    now()
  )
  RETURNING id INTO profile_id;
  
  RETURN profile_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_user_profile(uuid, jsonb) TO service_role;