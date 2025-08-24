-- Fix 1: Repair bad started_at timestamps (safety first - only touch obviously bogus ones)
UPDATE assessment_sessions 
SET started_at = COALESCE(started_at, created_at) 
WHERE started_at IS NULL 
   OR started_at < '2000-01-01'::timestamp;

-- Add constraint to prevent epoch timestamps
ALTER TABLE assessment_sessions 
ADD CONSTRAINT chk_started_at_sane 
CHECK (started_at >= '2000-01-01'::timestamp);

-- Fix 2: Add country_iso2 column for proper country mapping
ALTER TABLE assessment_sessions 
ADD COLUMN IF NOT EXISTS country_iso2 TEXT;

-- Fix 3: Create type distribution view for dashboard
CREATE OR REPLACE VIEW v_type_distribution AS
SELECT 
  type_code,
  COUNT(*) as n
FROM profiles 
WHERE type_code IS NOT NULL
GROUP BY type_code 
ORDER BY n DESC;

-- Fix 4: Create quality summary view for aggregated metrics
CREATE OR REPLACE VIEW v_quality_summary AS
SELECT
  ROUND(AVG(inconsistency)::numeric, 2) as inconsistency_mean,
  ROUND(AVG(sd_index)::numeric, 2) as sd_index_mean,
  ROUND(AVG(func_balance)::numeric, 2) as function_balance_mean,
  ROUND(AVG(top1_fit)::numeric, 2) as fit_mean,
  ROUND(AVG(top_gap)::numeric, 2) as gap_mean,
  COUNT(*) as n_sessions
FROM v_quality;

-- Fix 5: Update country activity view to emit proper ISO-2 codes
CREATE OR REPLACE VIEW v_activity_country_30d AS
SELECT 
  LOWER(COALESCE(country_iso2, 'unknown')) as iso2,
  country_iso2 as country_name,
  COUNT(*)::bigint as sessions
FROM assessment_sessions s
JOIN profiles p ON p.session_id = s.id
WHERE s.created_at >= NOW() - INTERVAL '30 days'
  AND s.status = 'completed'
GROUP BY country_iso2
HAVING COUNT(*) > 0
ORDER BY sessions DESC;