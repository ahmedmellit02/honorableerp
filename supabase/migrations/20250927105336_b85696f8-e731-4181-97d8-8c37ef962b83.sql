-- Fix ban_device function to handle re-banning previously unbanned devices
CREATE OR REPLACE FUNCTION public.ban_device(fingerprint text, reason_param text DEFAULT NULL::text, banned_by_param uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Use UPSERT to either insert new record or update existing one
  INSERT INTO public.banned_devices (
    device_fingerprint,
    reason,
    banned_by,
    is_active,
    banned_at
  ) VALUES (
    fingerprint,
    reason_param,
    COALESCE(banned_by_param, auth.uid()),
    true,
    now()
  )
  ON CONFLICT (device_fingerprint) 
  DO UPDATE SET 
    is_active = true,
    banned_at = now(),
    reason = COALESCE(reason_param, banned_devices.reason),
    banned_by = COALESCE(banned_by_param, auth.uid());
END;
$function$