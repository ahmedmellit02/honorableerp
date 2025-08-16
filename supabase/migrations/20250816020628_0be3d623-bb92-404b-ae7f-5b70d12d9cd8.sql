-- Create a helper function to assign roles by email
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