-- Delete existing user and create with proper Supabase auth format
DELETE FROM auth.users WHERE email = 'sanaeadam16@gmail.com';

-- Insert user with proper Supabase authentication
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_sent_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'sanaeadam16@gmail.com',
  '$2a$10$xQRqrHFm/QJJwMwAVXfx9eQOkD4VAo9LZJpB9XrzOyNfk8N8.KWd6',
  now(),
  now(),
  now(),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"email": "sanaeadam16@gmail.com"}'::jsonb,
  false,
  now()
);

-- Add the user role
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'agent'::app_role FROM auth.users WHERE email = 'sanaeadam16@gmail.com';