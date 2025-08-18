-- Create user using proper Supabase auth format
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change_token,
  phone_change_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'sanaeadam16@gmail.com',
  '$2a$10$J7JfJb3wVWKjzGz5L3QlNOEKGjJzD3r4J1JcjWw4z7D2gT8vU6BI2',
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"email": "sanaeadam16@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb,
  false,
  '',
  '',
  ''
);

-- Add the user role
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'agent'::app_role FROM auth.users WHERE email = 'sanaeadam16@gmail.com';

-- Fix the search path security warnings for functions
ALTER FUNCTION public.get_all_system_balances() SET search_path = public;
ALTER FUNCTION public.get_system_balance(text) SET search_path = public;
ALTER FUNCTION public.get_sales_monthly_aggregates() SET search_path = public;