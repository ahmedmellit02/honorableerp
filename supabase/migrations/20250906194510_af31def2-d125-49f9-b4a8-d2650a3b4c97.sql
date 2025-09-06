-- Update check_and_generate_notification trigger function to check for flights departing in 2 days
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
  -- Only generate notifications for Flight Confirmed with registration departing in 2 days
  IF NEW.type = 'Flight Confirmed' AND 
     NEW.has_registration = true AND 
     NEW.departure_date = CURRENT_DATE + INTERVAL '2 days' THEN
    
    -- Check if notifications already exist for this sale
    SELECT COUNT(*) INTO existing_count 
    FROM public.notifications 
    WHERE sale_id = NEW.id AND notification_type = 'flight';
    
    IF existing_count = 0 THEN
      notification_message := 'Enregistrement/RW pour ' || NEW.client_name || ' - ' || NEW.phone_number;
      notification_time := (NEW.departure_date || ' ' || NEW.departure_time)::TIMESTAMP - INTERVAL '48 hours';
      
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
  
  RETURN NEW;
END;
$function$;