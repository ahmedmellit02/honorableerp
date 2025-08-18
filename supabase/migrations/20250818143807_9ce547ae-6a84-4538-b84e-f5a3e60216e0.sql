-- Update Sanae's email address to sanaeadam16@gmail.com
UPDATE auth.users 
SET 
  email = 'sanaeadam16@gmail.com',
  raw_user_meta_data = '{"email": "sanaeadam16@gmail.com"}'::jsonb
WHERE email = 'sanae@agence.com';