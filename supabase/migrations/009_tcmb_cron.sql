-- Schedule monthly TCMB EVDS data ingestion.
-- Runs on the 6th of each month at 06:00 UTC (~35 days after month-end).
-- Uses pg_cron + pg_net to invoke the edge function.

select cron.schedule(
  'ingest-tcmb-monthly',
  '0 6 6 * *',
  $$
  select net.http_post(
    url    := current_setting('app.settings.supabase_url') || '/functions/v1/ingest-tcmb',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type',  'application/json'
    ),
    body   := '{}'::jsonb
  );
  $$
);
