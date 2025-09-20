-- Fix security warnings by setting search_path for functions that don't have it set

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix set_updated_at function  
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- Fix create_demo_user function
CREATE OR REPLACE FUNCTION public.create_demo_user()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- This function can be used to manually confirm the demo user
  -- The actual user creation should be done through the Supabase Auth UI
  -- This is just a placeholder for any demo-related database setup
  
  -- Add any demo-specific data setup here if needed
  NULL;
END;
$function$;