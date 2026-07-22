-- 1. Restrict price_history INSERT: block all client inserts. Edge function uses service role which bypasses RLS.
DROP POLICY IF EXISTS "System can insert price history" ON public.price_history;

CREATE POLICY "Only service role can insert price history"
  ON public.price_history
  FOR INSERT
  WITH CHECK (false);

-- 2. Move extensions out of public schema
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Unschedule existing job (if present) so dropping pg_cron is safe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'price-monitoring-job';
  END IF;
END $$;

-- Drop and recreate extensions in the extensions schema
DROP EXTENSION IF EXISTS pg_cron;
DROP EXTENSION IF EXISTS pg_net;

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Reschedule the price monitoring cron job
SELECT cron.schedule(
  'price-monitoring-job',
  '0 */6 * * *',
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