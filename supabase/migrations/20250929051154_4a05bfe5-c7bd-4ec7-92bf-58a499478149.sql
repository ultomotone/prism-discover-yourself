-- STEP-BY-STEP FIX: Fix data first, add constraint later
-- 1) Create staging and fix the 8 core questions
DROP TABLE IF EXISTS public.assessment_scoring_key_staging;
CREATE TABLE public.assessment_scoring_key_staging AS
SELECT * FROM public.assessment_scoring_key;

-- Fix Q9 & Q10: Self-Reported Behavioral Outcomes 
UPDATE public.assessment_scoring_key_staging 
SET 
  tag = 'Ti_S',
  weight = 1,
  scale_type = 'LIKERT_1_7'
WHERE question_id = 9;

UPDATE public.assessment_scoring_key_staging 
SET 
  tag = 'Te_S', 
  weight = 1,
  scale_type = 'LIKERT_1_7'  
WHERE question_id = 10;

-- Fix Q238-243: Validity & Quality Control
UPDATE public.assessment_scoring_key_staging 
SET 
  tag = 'Ti_S',
  weight = 1,
  scale_type = 'LIKERT_1_5'
WHERE question_id IN (238, 239, 240, 241, 242, 243);

-- 2) VERSION BUMP
UPDATE public.scoring_config 
SET value = '"v1.2.2"'::jsonb, 
    updated_at = now()
WHERE key = 'results_version';

-- 3) ATOMIC PROMOTION (without constraint yet)
BEGIN;
  DELETE FROM public.assessment_scoring_key;
  INSERT INTO public.assessment_scoring_key
  SELECT * FROM public.assessment_scoring_key_staging;
COMMIT;

-- 4) CREATE LINTING FUNCTION
CREATE OR REPLACE FUNCTION public.scoring_key_lint()
RETURNS TABLE(issue text, question_id integer, number integer, question_type text, section text)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT 
    'MISSING_FUNC_TAGS'::text, 
    q.id, 
    q.order_index, 
    q.type,
    q.section
  FROM public.assessment_scoring_key sk
  JOIN public.assessment_questions q ON q.id = sk.question_id
  WHERE q.type ilike 'likert%'
    AND sk.scale_type != 'META'
    AND (sk.tag IS NULL OR sk.tag = '' OR sk.weight = 0);
$$;

-- 5) CHECK FOR REMAINING ISSUES
SELECT * FROM public.scoring_key_lint();

-- 6) AUDIT LOG
INSERT INTO public.fn_logs(evt, payload)
VALUES ('scoring_key_fix_step1', jsonb_build_object(
  'items_fixed', ARRAY[9,10,238,239,240,241,242,243],
  'version', 'v1.2.2',
  'step', 'data_fix_complete',
  'fix_applied_at', now()
));