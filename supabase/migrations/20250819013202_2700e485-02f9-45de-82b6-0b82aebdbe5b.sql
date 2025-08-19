-- Update the generate_notifications function with simplified message template
CREATE OR REPLACE FUNCTION public.generate_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  sale_record RECORD;
  user_record RECORD;
  notification_message TEXT;
  notification_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate notifications for flights with registration 24h before departure
  FOR sale_record IN
    SELECT 
      s.id,
      s.user_id,
      s.client_name,
      s.phone_number,
      s.departure_date,
      s.departure_time
    FROM public.sales s
    WHERE s.type = 'Flight Confirmed'
      AND s.has_registration = true
      AND s.departure_date = CURRENT_DATE + INTERVAL '1 day'
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n 
        WHERE n.sale_id = s.id AND n.notification_type = 'flight'
      )
  LOOP
    notification_message := 'Enregistrement pour ' || sale_record.client_name || ' - ' || sale_record.phone_number;
    
    notification_time := (sale_record.departure_date || ' ' || sale_record.departure_time)::TIMESTAMP - INTERVAL '24 hours';
    
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
        sale_record.id,
        sale_record.client_name,
        'flight',
        notification_message,
        notification_time
      );
    END LOOP;
  END LOOP;

  -- Generate notifications for RW services 24h before scheduled time
  FOR sale_record IN
    SELECT 
      s.id,
      s.user_id,
      s.client_name,
      s.phone_number,
      s.rw_date,
      s.rw_time
    FROM public.sales s
    WHERE s.type = 'RW 1'
      AND s.rw_date = CURRENT_DATE + INTERVAL '1 day'
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n 
        WHERE n.sale_id = s.id AND n.notification_type = 'rw'
      )
  LOOP
    notification_message := 'RW pour ' || sale_record.client_name || ' - ' || sale_record.phone_number;
    
    notification_time := (sale_record.rw_date || ' ' || sale_record.rw_time)::TIMESTAMP - INTERVAL '24 hours';
    
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
        sale_record.id,
        sale_record.client_name,
        'rw',
        notification_message,
        notification_time
      );
    END LOOP;
  END LOOP;
END;
$function$;

-- Update the check_and_generate_notification trigger function with simplified message template
CREATE OR REPLACE FUNCTION public.check_and_generate_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_record RECORD;
  notification_message TEXT;
  notification_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- If it's a flight with registration departing tomorrow, generate notification immediately
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
  
  -- If it's an RW service for tomorrow, generate notification immediately
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
$function$;