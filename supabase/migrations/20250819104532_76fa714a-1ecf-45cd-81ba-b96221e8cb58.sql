-- Update notification function to only notify the sale creator (not all users)
CREATE OR REPLACE FUNCTION public.check_and_generate_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  notification_message TEXT;
  notification_time TIMESTAMP WITH TIME ZONE;
  existing_count INTEGER;
BEGIN
  -- If it's a flight with registration departing tomorrow, generate notification
  IF NEW.type = 'Flight Confirmed' AND 
     NEW.has_registration = true AND 
     NEW.departure_date = CURRENT_DATE + INTERVAL '1 day' THEN
    
    -- Check if notifications already exist for this sale
    SELECT COUNT(*) INTO existing_count 
    FROM public.notifications 
    WHERE sale_id = NEW.id AND notification_type = 'flight';
    
    IF existing_count = 0 THEN
      notification_message := 'Enregistrement pour ' || NEW.client_name || ' - ' || NEW.phone_number;
      notification_time := (NEW.departure_date || ' ' || NEW.departure_time)::TIMESTAMP - INTERVAL '24 hours';
      
      -- Create notification only for the sale creator
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
        notification_message,
        notification_time
      );
    END IF;
  END IF;
  
  -- If it's an RW service for tomorrow, generate notification
  IF NEW.type = 'RW 1' AND 
     NEW.rw_date = CURRENT_DATE + INTERVAL '1 day' THEN
    
    -- Check if notifications already exist for this sale
    SELECT COUNT(*) INTO existing_count 
    FROM public.notifications 
    WHERE sale_id = NEW.id AND notification_type = 'rw';
    
    IF existing_count = 0 THEN
      notification_message := 'RW pour ' || NEW.client_name || ' - ' || NEW.phone_number;
      notification_time := (NEW.rw_date || ' ' || NEW.rw_time)::TIMESTAMP - INTERVAL '24 hours';
      
      -- Create notification only for the sale creator
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
        notification_message,
        notification_time
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$