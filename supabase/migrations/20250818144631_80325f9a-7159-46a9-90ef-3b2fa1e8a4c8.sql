-- Delete the problematic user account and recreate properly
DELETE FROM auth.users WHERE email = 'sanaeadam16@gmail.com';

-- Create a proper user account using auth admin functions
SELECT auth.admin_create_user(
  email => 'sanaeadam16@gmail.com',
  password => '12345@',
  email_confirm => true
);