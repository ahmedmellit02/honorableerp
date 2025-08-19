-- Create Sanae's account properly without the generated column
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data,
  is_super_admin
) VALUES (
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'sanaeadam16@gmail.com',
  crypt('12345@', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"email": "sanaeadam16@gmail.com"}'::jsonb,
  '{}'::jsonb,
  false
);