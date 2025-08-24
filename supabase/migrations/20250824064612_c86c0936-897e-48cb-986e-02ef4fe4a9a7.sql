-- Add cron jobs for health and maintenance operations

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily calibration training job (if calibration is enabled)
SELECT cron.schedule(
  'train-calibration-daily',
  '0 2 * * *', -- 2 AM UTC daily
  $$
  DO $$
  DECLARE
    calibration_enabled boolean;
  BEGIN
    -- Check if calibration training is enabled
    SELECT (value->>'enabled')::boolean INTO calibration_enabled
    FROM scoring_config 
    WHERE key = 'calibration_training'
    LIMIT 1;
    
    -- Only run if enabled (defaults to false if not set)
    IF COALESCE(calibration_enabled, false) THEN
      -- Call the training function
      PERFORM net.http_post(
        url := 'https://gnkuikentdtnatazeriu.supabase.co/functions/v1/train_confidence_calibration',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U"}'::jsonb,
        body := '{"scheduled": true}'::jsonb
      );
    END IF;
  END $$;
  $$
);

-- Daily dashboard statistics update
SELECT cron.schedule(
  'update-dashboard-stats-daily',
  '0 1 * * *', -- 1 AM UTC daily  
  $$
  SELECT update_dashboard_statistics();
  $$
);

-- Weekly backfill and cleanup (Sundays at 3 AM)
SELECT cron.schedule(
  'weekly-maintenance',
  '0 3 * * 0', -- 3 AM UTC on Sundays
  $$
  DO $$
  BEGIN
    -- Update dashboard statistics for the past week
    PERFORM update_dashboard_statistics_range(CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE);
    
    -- Log maintenance completion
    INSERT INTO scoring_config (key, value, updated_at)
    VALUES ('last_maintenance', to_jsonb(now()), now())
    ON CONFLICT (key) DO UPDATE SET 
      value = EXCLUDED.value,
      updated_at = EXCLUDED.updated_at;
  END $$;
  $$
);