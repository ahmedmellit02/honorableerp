-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('flight', 'rw')),
  message TEXT NOT NULL,
  trigger_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_trigger_time ON public.notifications(trigger_time);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate notifications 24h before departure
CREATE OR REPLACE FUNCTION public.generate_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sale_record RECORD;
  notification_message TEXT;
  notification_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate notifications for flights with registration 24h before departure
  FOR sale_record IN
    SELECT 
      s.id,
      s.user_id,
      s.client_name,
      s.departure_date,
      s.departure_time,
      s.from_airport,
      s.to_airport
    FROM public.sales s
    WHERE s.type = 'Flight Confirmed'
      AND s.has_registration = true
      AND s.departure_date = CURRENT_DATE + INTERVAL '1 day'
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n 
        WHERE n.sale_id = s.id AND n.notification_type = 'flight'
      )
  LOOP
    notification_message := 'Rappel: Enregistrement pour ' || sale_record.client_name || 
                           ' - Vol ' || COALESCE(sale_record.from_airport, '') || ' → ' || 
                           COALESCE(sale_record.to_airport, '') || ' demain à ' || 
                           sale_record.departure_time::TEXT;
    
    notification_time := (sale_record.departure_date || ' ' || sale_record.departure_time)::TIMESTAMP - INTERVAL '24 hours';
    
    INSERT INTO public.notifications (
      user_id,
      sale_id,
      client_name,
      notification_type,
      message,
      trigger_time
    ) VALUES (
      sale_record.user_id,
      sale_record.id,
      sale_record.client_name,
      'flight',
      notification_message,
      notification_time
    );
  END LOOP;

  -- Generate notifications for RW services 24h before scheduled time
  FOR sale_record IN
    SELECT 
      s.id,
      s.user_id,
      s.client_name,
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
    notification_message := 'Rappel: RW pour ' || sale_record.client_name || 
                           ' demain à ' || sale_record.rw_time::TEXT;
    
    notification_time := (sale_record.rw_date || ' ' || sale_record.rw_time)::TIMESTAMP - INTERVAL '24 hours';
    
    INSERT INTO public.notifications (
      user_id,
      sale_id,
      client_name,
      notification_type,
      message,
      trigger_time
    ) VALUES (
      sale_record.user_id,
      sale_record.id,
      sale_record.client_name,
      'rw',
      notification_message,
      notification_time
    );
  END LOOP;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = true, updated_at = now()
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$;