-- Update generate_notifications function to send notifications 2 days before departure
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
  -- Generate notifications for flights with registration 48h before departure
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
      AND s.departure_date = CURRENT_DATE + INTERVAL '2 days'
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n 
        WHERE n.sale_id = s.id AND n.notification_type = 'flight'
      )
  LOOP
    notification_message := 'Enregistrement/RW pour ' || sale_record.client_name || ' - ' || sale_record.phone_number;
    
    notification_time := (sale_record.departure_date || ' ' || sale_record.departure_time)::TIMESTAMP - INTERVAL '48 hours';
    
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
END;
$function$;