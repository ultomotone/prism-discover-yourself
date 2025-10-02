-- Update cron jobs to use new edge functions
-- First, remove old jobs if they exist
SELECT cron.unschedule(jobid) 
FROM cron.job 
WHERE jobname IN ('compute-reliability-daily', 'compute-retest-daily');

-- Schedule reliability computation (daily at 2 AM UTC)
SELECT cron.schedule(
  'compute-reliability-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://gnkuikentdtnatazeriu.supabase.co/functions/v1/compute-reliability',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Schedule retest computation (daily at 3 AM UTC)
SELECT cron.schedule(
  'compute-retest-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://gnkuikentdtnatazeriu.supabase.co/functions/v1/compute-retest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);