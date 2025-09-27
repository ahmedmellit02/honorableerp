-- Create banned_devices table to track banned device fingerprints
CREATE TABLE public.banned_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_fingerprint TEXT NOT NULL UNIQUE,
  banned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  banned_by UUID NOT NULL,
  reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create device_sessions table to track device usage
CREATE TABLE public.device_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_fingerprint TEXT NOT NULL,
  user_id UUID NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.banned_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for banned_devices (only managers can manage)
CREATE POLICY "Only managers can view banned devices" 
ON public.banned_devices 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'manager'
));

CREATE POLICY "Only managers can insert banned devices" 
ON public.banned_devices 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'manager'
) AND auth.uid() = banned_by);

CREATE POLICY "Only managers can update banned devices" 
ON public.banned_devices 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'manager'
));

-- RLS policies for device_sessions (users can view their own sessions, managers can view all)
CREATE POLICY "Users can view their own device sessions" 
ON public.device_sessions 
FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'manager'
));

CREATE POLICY "Authenticated users can insert device sessions" 
ON public.device_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create database functions
CREATE OR REPLACE FUNCTION public.check_device_ban_status(fingerprint TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.banned_devices
    WHERE device_fingerprint = fingerprint 
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.log_device_session(
  fingerprint TEXT,
  user_id_param UUID,
  ip_addr TEXT DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update device session
  INSERT INTO public.device_sessions (
    device_fingerprint,
    user_id,
    ip_address,
    user_agent,
    last_seen_at
  ) VALUES (
    fingerprint,
    user_id_param,
    ip_addr,
    user_agent_param,
    now()
  )
  ON CONFLICT (device_fingerprint, user_id) 
  DO UPDATE SET 
    last_seen_at = now(),
    ip_address = EXCLUDED.ip_address,
    user_agent = EXCLUDED.user_agent;
END;
$$;

CREATE OR REPLACE FUNCTION public.ban_device(
  fingerprint TEXT,
  reason_param TEXT DEFAULT NULL,
  banned_by_param UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.banned_devices (
    device_fingerprint,
    reason,
    banned_by
  ) VALUES (
    fingerprint,
    reason_param,
    COALESCE(banned_by_param, auth.uid())
  );
END;
$$;

-- Add trigger for updated_at on banned_devices
CREATE TRIGGER update_banned_devices_updated_at
BEFORE UPDATE ON public.banned_devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint on device_sessions for device_fingerprint + user_id combination
ALTER TABLE public.device_sessions 
ADD CONSTRAINT unique_device_user 
UNIQUE (device_fingerprint, user_id);