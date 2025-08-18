-- Reset Sanae's password to ensure it's set correctly
UPDATE auth.users 
SET encrypted_password = crypt('12345@', gen_salt('bf'))
WHERE email = 'sanaeadam16@gmail.com';