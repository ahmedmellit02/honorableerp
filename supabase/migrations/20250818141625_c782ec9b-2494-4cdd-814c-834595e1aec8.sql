-- Update user email addresses in auth.users table
UPDATE auth.users 
SET email = 'm.elasri73@gmail.com', 
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"m.elasri73@gmail.com"'),
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'mohammedelasri@chorafaa.com';

UPDATE auth.users 
SET email = 'mehdimellit@gmail.com', 
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"mehdimellit@gmail.com"'),
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'mehdimellit@chorafaa.com';

UPDATE auth.users 
SET email = 'ahmedmellit02@gmail.com', 
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"ahmedmellit02@gmail.com"'),
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'ahmedmellit@chorafaa.com';

UPDATE auth.users 
SET email = 'achrafalarabi284@gmail.com', 
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"achrafalarabi284@gmail.com"'),
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'achrafelouahidy@chorafaa.com';

UPDATE auth.users 
SET email = 'honorablevoyage@gmail.com', 
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"honorablevoyage@gmail.com"'),
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'mohammedmellit@chorafaa.com';