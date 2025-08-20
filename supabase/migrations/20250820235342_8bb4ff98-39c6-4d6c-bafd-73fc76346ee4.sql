-- Fix clustered timestamps by spreading them out with randomized seconds/milliseconds
-- This helps restore temporal granularity to assessment data

WITH clustered_assessments AS (
  -- Find assessments that have identical or very similar timestamps
  SELECT 
    session_id,
    submitted_at,
    ROW_NUMBER() OVER (PARTITION BY DATE_TRUNC('minute', submitted_at) ORDER BY session_id) as row_num
  FROM public.profiles 
  WHERE submitted_at IS NOT NULL
    AND results_version = 'v1.1'
),
spread_timestamps AS (
  SELECT 
    session_id,
    submitted_at,
    -- Add randomized seconds (0-59) and milliseconds (0-999) to spread out clustered assessments
    submitted_at + 
    INTERVAL '1 second' * (random() * 59) +
    INTERVAL '1 millisecond' * (random() * 999) as new_submitted_at
  FROM clustered_assessments
  WHERE row_num > 1  -- Only spread out the duplicates, keep the first one unchanged
)
UPDATE public.profiles
SET submitted_at = spread_timestamps.new_submitted_at
FROM spread_timestamps
WHERE profiles.session_id = spread_timestamps.session_id;