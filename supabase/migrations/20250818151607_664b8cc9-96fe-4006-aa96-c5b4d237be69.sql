-- Clean up existing data for sanaeadam16@gmail.com
DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'sanaeadam16@gmail.com');
DELETE FROM auth.users WHERE email = 'sanaeadam16@gmail.com';

-- Create the user with a pre-hashed password for '12345@'
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
  is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'sanaeadam16@gmail.com',
  '$2a$10$zQK1XzFfhwwQ2bJxA3JBfOKGdPD2H7/FGCKKnxGZLMzL.z8.R5xo6',
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"email": "sanaeadam16@gmail.com"}'::jsonb,
  false
);

-- Add the user role
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'agent'::app_role FROM auth.users WHERE email = 'sanaeadam16@gmail.com';