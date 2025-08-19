-- Update the function to create notifications for all users
CREATE OR REPLACE FUNCTION public.check_and_generate_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  notification_message TEXT;
  notification_time TIMESTAMP WITH TIME ZONE;
  user_record RECORD;
BEGIN
  -- If it's a flight with registration departing tomorrow, generate notification
  IF NEW.type = 'Flight Confirmed' AND 
     NEW.has_registration = true AND 
     NEW.departure_date = CURRENT_DATE + INTERVAL '1 day' THEN
    
    notification_message := 'Enregistrement pour ' || NEW.client_name || ' - ' || NEW.phone_number;
    notification_time := (NEW.departure_date || ' ' || NEW.departure_time)::TIMESTAMP - INTERVAL '24 hours';
    
    -- Create notification for all users
    FOR user_record IN
      SELECT DISTINCT user_id FROM public.user_roles
    LOOP
      INSERT INTO public.notifications (
        user_id,
        sale_id,
        client_name,
        notification_type,
        message,
        trigger_time
      ) VALUES (
        user_record.user_id,
        NEW.id,
        NEW.client_name,
        'flight',
        notification_message,
        notification_time
      );
    END LOOP;
  END IF;
  
  -- If it's an RW service for tomorrow, generate notification
  IF NEW.type = 'RW 1' AND 
     NEW.rw_date = CURRENT_DATE + INTERVAL '1 day' THEN
    
    notification_message := 'RW pour ' || NEW.client_name || ' - ' || NEW.phone_number;
    notification_time := (NEW.rw_date || ' ' || NEW.rw_time)::TIMESTAMP - INTERVAL '24 hours';
    
    -- Create notification for all users
    FOR user_record IN
      SELECT DISTINCT user_id FROM public.user_roles
    LOOP
      INSERT INTO public.notifications (
        user_id,
        sale_id,
        client_name,
        notification_type,
        message,
        trigger_time
      ) VALUES (
        user_record.user_id,
        NEW.id,
        NEW.client_name,
        'rw',
        notification_message,
        notification_time
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$