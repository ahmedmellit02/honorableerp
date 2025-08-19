-- Debug and fix the notification function
-- The issue is that the function is being called but the check isn't working properly
-- Let's add some debugging and improve the logic

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
  existing_count INTEGER;
BEGIN
  -- Debug: Log what we're checking
  RAISE NOTICE 'Checking sale ID: %, Type: %, RW Date: %, Departure Date: %', 
    NEW.id, NEW.type, NEW.rw_date, NEW.departure_date;
  
  -- If it's a flight with registration departing tomorrow, generate notification
  IF NEW.type = 'Flight Confirmed' AND 
     NEW.has_registration = true AND 
     NEW.departure_date = CURRENT_DATE + INTERVAL '1 day' THEN
    
    -- Check if notifications already exist for this sale
    SELECT COUNT(*) INTO existing_count 
    FROM public.notifications 
    WHERE sale_id = NEW.id AND notification_type = 'flight';
    
    RAISE NOTICE 'Flight notifications existing for sale %: %', NEW.id, existing_count;
    
    IF existing_count = 0 THEN
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
      
      RAISE NOTICE 'Created flight notifications for sale %', NEW.id;
    END IF;
  END IF;
  
  -- If it's an RW service for tomorrow, generate notification
  IF NEW.type = 'RW 1' AND 
     NEW.rw_date = CURRENT_DATE + INTERVAL '1 day' THEN
    
    -- Check if notifications already exist for this sale
    SELECT COUNT(*) INTO existing_count 
    FROM public.notifications 
    WHERE sale_id = NEW.id AND notification_type = 'rw';
    
    RAISE NOTICE 'RW notifications existing for sale %: %', NEW.id, existing_count;
    
    IF existing_count = 0 THEN
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
      
      RAISE NOTICE 'Created RW notifications for sale %', NEW.id;
    END IF;
  ELSE
    RAISE NOTICE 'RW condition not met: type=%, rw_date=%, current_date+1=%', 
      NEW.type, NEW.rw_date, CURRENT_DATE + INTERVAL '1 day';
  END IF;
  
  RETURN NEW;
END;
$function$