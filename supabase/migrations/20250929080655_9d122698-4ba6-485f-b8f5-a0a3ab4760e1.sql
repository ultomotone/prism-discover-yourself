-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily reminder job at 10 AM UTC
SELECT cron.schedule(
  'daily-assessment-reminders',
  '0 10 * * *', -- Daily at 10 AM UTC
  $$
  SELECT net.http_post(
    url:='https://gnkuikentdtnatazeriu.supabase.co/functions/v1/send-assessment-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U"}'::jsonb,
    body:='{"reminder_type": "both"}'::jsonb
  ) as request_id;
  $$
);