-- Fix Sanae's account by setting the missing aud field
UPDATE auth.users 
SET aud = 'authenticated'
WHERE email = 'sanaeadam16@gmail.com';