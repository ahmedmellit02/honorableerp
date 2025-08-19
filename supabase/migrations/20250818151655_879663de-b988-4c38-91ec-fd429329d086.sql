-- Completely remove all traces of the user
DELETE FROM public.user_roles WHERE user_id = 'd7590918-759c-44a8-a85c-c225f6a9c702';
DELETE FROM auth.users WHERE id = 'd7590918-759c-44a8-a85c-c225f6a9c702';