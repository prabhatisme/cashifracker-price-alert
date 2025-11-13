-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule price monitoring to run every 6 hours
SELECT cron.schedule(
  'price-monitoring-job',
  '0 */6 * * *', -- Every 6 hours at the top of the hour
  $$
  SELECT net.http_post(
    url := 'https://fsoqhhqbtmessubsxhsp.supabase.co/functions/v1/price-monitor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb3FoaHFidG1lc3N1YnN4aHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzExOTcsImV4cCI6MjA2NTk0NzE5N30.swJkiES5X1jdaAnfBuUnCMHZSXRaTq6yud79S_deNLk'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);