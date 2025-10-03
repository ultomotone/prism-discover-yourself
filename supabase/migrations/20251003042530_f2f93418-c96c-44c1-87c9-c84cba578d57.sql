
-- Fix v_active_scale_items view to not filter by required field
-- The original view was excluding all items because required=false
DROP VIEW IF EXISTS v_active_scale_items;

CREATE OR REPLACE VIEW v_active_scale_items AS
SELECT 
  sk.tag AS scale_code,
  sk.question_id,
  sk.weight,
  sk.reverse_scored,
  q.type AS question_type
FROM assessment_scoring_key sk
JOIN assessment_questions q ON q.id = sk.question_id
WHERE sk.scale_type != 'META'
  AND sk.tag IS NOT NULL
  AND sk.weight != 0;

-- Verify the fix
COMMENT ON VIEW v_active_scale_items IS 'Active scale items for psychometric analysis - includes all non-META items with tags';
