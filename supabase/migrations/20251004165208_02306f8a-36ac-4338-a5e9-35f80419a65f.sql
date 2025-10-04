-- Drop device management tables and functions

-- Drop functions first (due to dependencies)
DROP FUNCTION IF EXISTS public.check_device_ban_status(text);
DROP FUNCTION IF EXISTS public.log_device_session(text, uuid, text, text);
DROP FUNCTION IF EXISTS public.ban_device(text, text, uuid);

-- Drop tables
DROP TABLE IF EXISTS public.banned_devices CASCADE;
DROP TABLE IF EXISTS public.device_sessions CASCADE;