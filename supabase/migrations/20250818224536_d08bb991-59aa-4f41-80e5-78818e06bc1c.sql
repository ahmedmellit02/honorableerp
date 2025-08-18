-- Update existing user roles for current users
DO $$
BEGIN
  -- Update existing roles based on email addresses
  UPDATE public.user_roles 
  SET role = 'manager'
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'honorablevoyage@gmail.com'
  );

  UPDATE public.user_roles 
  SET role = 'cashier'
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN ('m.elasri73@gmail.com', 'demo@agence.com')
  );

  UPDATE public.user_roles 
  SET role = 'super_agent'
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN ('ahmedmellit02@gmail.com', 'mehdimellit@gmail.com')
  );

  UPDATE public.user_roles 
  SET role = 'agent'
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN ('achrafalarabi284@gmail.com', 'sanaeadam16@gmail.com')
  );
END $$;