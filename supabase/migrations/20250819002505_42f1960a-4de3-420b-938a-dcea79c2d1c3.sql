-- Set up cron job to run notification generation daily at 9 AM
SELECT cron.schedule(
  'generate-daily-notifications',
  '0 9 * * *', -- 9 AM every day
  $$
  SELECT
    net.http_post(
      url := 'https://jokslxzxdjmsykfqnzmw.supabase.co/functions/v1/generate-notifications',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impva3NseHp4ZGptc3lrZnFuem13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjM3NDMsImV4cCI6MjA3MDgzOTc0M30.rrWLBMyouNssPwCTh7bsefhTLZBfbRsPINg_pU_Cfq4"}'::jsonb
    ) as request_id;
  $$
);

-- Also create a manual function to test notification generation immediately
CREATE OR REPLACE FUNCTION public.test_generate_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Call the notification generation function
  PERFORM public.generate_notifications();
  
  -- Also call the edge function via HTTP for immediate testing
  PERFORM net.http_post(
    url := 'https://jokslxzxdjmsykfqnzmw.supabase.co/functions/v1/generate-notifications',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
END;
$$;