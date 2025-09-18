-- Assign agent role to the new user
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'agent'::app_role 
FROM auth.users 
WHERE email = 'imaneguini123@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'agent'::app_role;