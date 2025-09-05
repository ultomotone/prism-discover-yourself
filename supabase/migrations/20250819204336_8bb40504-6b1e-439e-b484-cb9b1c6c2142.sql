-- Add FC tracking columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fc_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fc_coverage_bucket TEXT DEFAULT 'None' CHECK (fc_coverage_bucket IN ('None', 'Partial', 'Full'));

-- Add FC tracking columns to assessment_responses table for better validation
ALTER TABLE public.assessment_responses ADD COLUMN IF NOT EXISTS value_coded TEXT;
ALTER TABLE public.assessment_responses ADD COLUMN IF NOT EXISTS valid_bool BOOLEAN DEFAULT TRUE;
ALTER TABLE public.assessment_responses ADD COLUMN IF NOT EXISTS pair_group TEXT;

-- Drop and recreate enhanced FC coverage view with better categorization
DROP VIEW IF EXISTS v_fc_coverage;
CREATE VIEW v_fc_coverage AS
SELECT
  r.session_id,
  COUNT(*) FILTER (WHERE sk.scale_type::text LIKE 'FORCED_CHOICE%' AND r.answer_value IS NOT NULL AND TRIM(r.answer_value) != '') as fc_count,
  COUNT(*) FILTER (WHERE sk.scale_type::text LIKE 'FORCED_CHOICE%') as fc_total_questions,
  COUNT(*) as answered_count,
  CASE 
    WHEN COUNT(*) FILTER (WHERE sk.scale_type::text LIKE 'FORCED_CHOICE%' AND r.answer_value IS NOT NULL AND TRIM(r.answer_value) != '') = 0 THEN 'None'
    WHEN COUNT(*) FILTER (WHERE sk.scale_type::text LIKE 'FORCED_CHOICE%' AND r.answer_value IS NOT NULL AND TRIM(r.answer_value) != '') < 20 THEN 'Partial'
    ELSE 'Full'
  END as fc_coverage_bucket
FROM assessment_responses r
JOIN assessment_scoring_key sk ON sk.question_id = r.question_id
GROUP BY r.session_id;

-- Create function to update FC metrics on profiles
CREATE OR REPLACE FUNCTION update_profile_fc_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profiles table with FC count and coverage bucket
  UPDATE profiles 
  SET 
    fc_count = (
      SELECT COALESCE(fc_count, 0) 
      FROM v_fc_coverage 
      WHERE session_id = NEW.session_id
    ),
    fc_coverage_bucket = (
      SELECT COALESCE(fc_coverage_bucket, 'None') 
      FROM v_fc_coverage 
      WHERE session_id = NEW.session_id
    )
  WHERE session_id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update FC metrics when profiles are inserted/updated
DROP TRIGGER IF EXISTS update_fc_metrics_trigger ON profiles;
CREATE TRIGGER update_fc_metrics_trigger
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_fc_metrics();

-- Backfill existing profiles with FC metrics
UPDATE profiles 
SET 
  fc_count = COALESCE(fc_coverage.fc_count, 0),
  fc_coverage_bucket = COALESCE(fc_coverage.fc_coverage_bucket, 'None')
FROM v_fc_coverage fc_coverage
WHERE profiles.session_id = fc_coverage.session_id;

-- Create view for FC coverage analytics
CREATE VIEW v_fc_analytics AS
SELECT 
  fc_coverage_bucket,
  COUNT(*) as session_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM v_fc_coverage
GROUP BY fc_coverage_bucket
ORDER BY 
  CASE fc_coverage_bucket 
    WHEN 'None' THEN 1 
    WHEN 'Partial' THEN 2 
    WHEN 'Full' THEN 3 
  END;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_fc_coverage ON profiles(fc_coverage_bucket);
CREATE INDEX IF NOT EXISTS idx_profiles_fc_count ON profiles(fc_count);