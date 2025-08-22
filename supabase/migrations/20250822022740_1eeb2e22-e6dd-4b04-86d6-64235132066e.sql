-- Fix dashboard statistics to count completed assessments, not started ones
CREATE OR REPLACE FUNCTION update_dashboard_statistics()
RETURNS void AS $$
BEGIN
  -- Delete existing data for today to avoid duplicates
  DELETE FROM dashboard_statistics WHERE stat_date = CURRENT_DATE;
  
  -- Insert fresh statistics for today
  INSERT INTO dashboard_statistics (
    stat_date,
    daily_assessments,
    total_assessments,
    overlay_positive,
    overlay_negative,
    type_distribution
  )
  WITH completed_sessions AS (
    SELECT s.id, s.created_at, s.completed_at, p.type_code, p.overlay
    FROM assessment_sessions s
    JOIN profiles p ON p.session_id = s.id
    WHERE s.status = 'completed'
      AND p.type_code IS NOT NULL
  ),
  today_completed AS (
    SELECT *
    FROM completed_sessions
    WHERE DATE(completed_at) = CURRENT_DATE
  ),
  all_completed AS (
    SELECT *
    FROM completed_sessions
  )
  SELECT 
    CURRENT_DATE as stat_date,
    (SELECT COUNT(*) FROM today_completed) as daily_assessments,
    (SELECT COUNT(*) FROM all_completed) as total_assessments,
    (SELECT COUNT(*) FROM today_completed WHERE overlay = 'positive') as overlay_positive,
    (SELECT COUNT(*) FROM today_completed WHERE overlay = 'negative') as overlay_negative,
    (
      SELECT jsonb_object_agg(type_code, count)
      FROM (
        SELECT type_code, COUNT(*) as count
        FROM today_completed
        GROUP BY type_code
      ) type_counts
    ) as type_distribution;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;