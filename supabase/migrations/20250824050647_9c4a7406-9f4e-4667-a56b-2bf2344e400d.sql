-- Fix remaining bad timestamps by setting them to 2025-01-01 if still problematic
UPDATE assessment_sessions 
SET started_at = '2025-01-01 00:00:00'::timestamp
WHERE started_at < '2000-01-01'::timestamp;

-- Add country column and views first, then constraint
ALTER TABLE assessment_sessions 
ADD COLUMN IF NOT EXISTS country_iso2 TEXT;

-- Create type distribution view 
CREATE OR REPLACE VIEW v_type_distribution AS
SELECT 
  type_code,
  COUNT(*) as n
FROM profiles 
WHERE type_code IS NOT NULL
GROUP BY type_code 
ORDER BY n DESC;

-- Create quality summary view
CREATE OR REPLACE VIEW v_quality_summary AS
SELECT
  ROUND(AVG(COALESCE(inconsistency, 0))::numeric, 2) as inconsistency_mean,
  ROUND(AVG(COALESCE(sd_index, 0))::numeric, 2) as sd_index_mean,
  ROUND(AVG(COALESCE(func_balance, 0))::numeric, 2) as function_balance_mean,
  ROUND(AVG(COALESCE(top1_fit, 0))::numeric, 2) as fit_mean,
  ROUND(AVG(COALESCE(top_gap, 0))::numeric, 2) as gap_mean,
  COUNT(*) as n_sessions
FROM v_quality
WHERE session_id IS NOT NULL;