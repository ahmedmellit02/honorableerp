-- Update banned_devices RLS policies to include super_agent role

-- Drop existing policies
DROP POLICY IF EXISTS "Only managers can view banned devices" ON public.banned_devices;
DROP POLICY IF EXISTS "Only managers can insert banned devices" ON public.banned_devices;  
DROP POLICY IF EXISTS "Only managers can update banned devices" ON public.banned_devices;
DROP POLICY IF EXISTS "Users can view their own device sessions" ON public.device_sessions;

-- Create updated policies that include super_agent role
CREATE POLICY "Managers and super agents can view banned devices" 
ON public.banned_devices 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('manager', 'super_agent')
));

CREATE POLICY "Managers and super agents can insert banned devices" 
ON public.banned_devices 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('manager', 'super_agent')
  ) 
  AND auth.uid() = banned_by
);

CREATE POLICY "Managers and super agents can update banned devices" 
ON public.banned_devices 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('manager', 'super_agent')
));

-- Update device_sessions policy to allow managers and super agents to view all sessions
CREATE POLICY "Users can view device sessions based on role" 
ON public.device_sessions 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('manager', 'super_agent')
  )
);