-- Insert new user Sanae with agent role (same as Achraf)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'sanae@agence.com',
  crypt('12345@', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"email": "sanae@agence.com"}'::jsonb,
  false,
  'authenticated'
);

-- The trigger will automatically assign 'agent' role to this user since it's not mohammedelasri@chorafaa.com