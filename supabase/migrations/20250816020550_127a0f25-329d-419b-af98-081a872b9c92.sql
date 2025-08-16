-- Create predefined users and assign roles
-- Note: These users will need to be created through Supabase Auth interface first
-- This migration just sets up the role assignments

-- Insert roles for predefined users
INSERT INTO public.user_roles (user_id, role) VALUES 
-- These UUIDs would be replaced with actual user IDs after user creation
-- For now, we'll create a function to handle role assignment by email

-- First, let's create a helper function to assign roles by email
CREATE OR REPLACE FUNCTION public.assign_role_by_email(user_email text, user_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Find the user ID from auth.users by email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = user_email;
    
    -- If user exists, insert or update their role
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, user_role)
        ON CONFLICT (user_id, role) 
        DO UPDATE SET role = EXCLUDED.role;
    END IF;
END;
$$;

-- Update RLS policy to allow updates for user roles
CREATE POLICY "Users can update their own role" 
ON public.user_roles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create a function to initialize default user roles after signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Assign cashier role to mohammedelasri@chorafaa.com
    IF NEW.email = 'mohammedelasri@chorafaa.com' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'cashier');
    ELSE
        -- Default role for all other users
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'agent');
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to automatically assign roles when users are created
CREATE TRIGGER on_auth_user_created_assign_role
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();