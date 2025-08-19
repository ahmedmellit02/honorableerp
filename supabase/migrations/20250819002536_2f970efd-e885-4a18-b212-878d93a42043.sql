-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Set up cron job to run notification generation daily at 9 AM
SELECT cron.schedule(
  'generate-daily-notifications',
  '0 9 * * *', -- 9 AM every day
  $$
  SELECT public.generate_notifications();
  $$
);

-- Also create a trigger that runs when a new sale is added with registration
CREATE OR REPLACE FUNCTION public.check_and_generate_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- If it's a flight with registration departing tomorrow, generate notification immediately
  IF NEW.type = 'Flight Confirmed' AND 
     NEW.has_registration = true AND 
     NEW.departure_date = CURRENT_DATE + INTERVAL '1 day' THEN
    
    INSERT INTO public.notifications (
      user_id,
      sale_id,
      client_name,
      notification_type,
      message,
      trigger_time
    ) VALUES (
      NEW.user_id,
      NEW.id,
      NEW.client_name,
      'flight',
      'Rappel: Enregistrement pour ' || NEW.client_name || 
      ' - Vol ' || COALESCE(NEW.from_airport, '') || ' → ' || 
      COALESCE(NEW.to_airport, '') || ' demain à ' || 
      NEW.departure_time::TEXT,
      (NEW.departure_date || ' ' || NEW.departure_time)::TIMESTAMP - INTERVAL '24 hours'
    );
  END IF;
  
  -- If it's an RW service for tomorrow, generate notification immediately
  IF NEW.type = 'RW 1' AND 
     NEW.rw_date = CURRENT_DATE + INTERVAL '1 day' THEN
    
    INSERT INTO public.notifications (
      user_id,
      sale_id,
      client_name,
      notification_type,
      message,
      trigger_time
    ) VALUES (
      NEW.user_id,
      NEW.id,
      NEW.client_name,
      'rw',
      'Rappel: RW pour ' || NEW.client_name || 
      ' demain à ' || NEW.rw_time::TEXT,
      (NEW.rw_date || ' ' || NEW.rw_time)::TIMESTAMP - INTERVAL '24 hours'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Create trigger on sales insert
CREATE TRIGGER notification_trigger
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_generate_notification();

-- Manually run the generation for existing sales that should have notifications
SELECT public.generate_notifications();