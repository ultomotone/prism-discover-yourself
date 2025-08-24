-- Backfill missing assessment_questions from responses of a specific session
-- This restores 247 questions referenced by session responses but missing from the library

-- Safety: only insert ids not already present
INSERT INTO public.assessment_questions (id, type, section, tag, order_index)
SELECT 
  r.question_id::int              AS id,
  COALESCE(NULLIF(r.question_type, ''), 'text') AS type,
  COALESCE(NULLIF(r.question_section, ''), 'General') AS section,
  NULL AS tag,
  r.question_id::int              AS order_index
FROM public.assessment_responses r
LEFT JOIN public.assessment_questions q 
  ON q.id = r.question_id
WHERE r.session_id = 'c6970644-8b35-4128-b5c4-53dd292141a9'
  AND q.id IS NULL
GROUP BY r.question_id, r.question_type, r.question_section;

-- Optional: ensure order_index is populated for any remaining nulls
UPDATE public.assessment_questions
SET order_index = id
WHERE order_index IS NULL;