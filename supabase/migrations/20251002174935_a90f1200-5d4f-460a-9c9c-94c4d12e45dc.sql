-- Seed basic identity calibration model so ECE isn't locked at zero
INSERT INTO public.calibration_model (
  stratum,
  version,
  method,
  knots,
  trained_at,
  training_size,
  validation_size,
  total_sample_size,
  calibration_error,
  brier_score
)
VALUES (
  '{}'::jsonb,
  'v1.2.1',
  'identity',
  '[]'::jsonb,
  now(),
  0,
  0,
  0,
  0.000,
  0.000
)
ON CONFLICT DO NOTHING;

-- Ensure pg_cron and pg_net are enabled for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule reliability computation (daily at 2 AM UTC)
SELECT cron.schedule(
  'compute-reliability-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://gnkuikentdtnatazeriu.supabase.co/functions/v1/compute-psychometrics',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U"}'::jsonb,
    body := '{"jobType": "reliability"}'::jsonb
  ) as request_id;
  $$
);

-- Schedule retest computation (daily at 3 AM UTC)
SELECT cron.schedule(
  'compute-retest-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://gnkuikentdtnatazeriu.supabase.co/functions/v1/compute-psychometrics',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U"}'::jsonb,
    body := '{"jobType": "retest"}'::jsonb
  ) as request_id;
  $$
);