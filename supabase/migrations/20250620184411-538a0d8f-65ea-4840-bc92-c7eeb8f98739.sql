
-- Enable the required extensions for cron jobs and HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the cron job to run price monitoring every hour
SELECT cron.schedule(
  'price-monitor-hourly',
  '0 * * * *', -- Run at the top of every hour
  $$
  SELECT
    net.http_post(
        url:='https://fsoqhhqbtmessubsxhsp.supabase.co/functions/v1/price-monitor',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb3FoaHFidG1lc3N1YnN4aHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzExOTcsImV4cCI6MjA2NTk0NzE5N30.swJkiES5X1jdaAnfBuUnCMHZSXRaTq6yud79S_deNLk"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);
