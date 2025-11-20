-- Activer les extensions nécessaires pour pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Supprimer le job s'il existe (sans erreur si inexistant)
DO $$
BEGIN
  PERFORM cron.unschedule('keep-alive-ping');
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorer l'erreur si le job n'existe pas
    NULL;
END $$;

-- Créer le cron job keep-alive (toutes les 5 minutes)
SELECT cron.schedule(
  'keep-alive-ping',
  '*/5 * * * *', -- Toutes les 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://fsdfzzhbydlmuiblgkvb.supabase.co/functions/v1/keep-alive',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZGZ6emhieWRsbXVpYmxna3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTE5NjUsImV4cCI6MjA3MjQ4Nzk2NX0.NlfYPNMEpTAqXbJsLpBM3ubw0U2o5S63NVveVzLUT4w"}'::jsonb
  ) as request_id;
  $$
);