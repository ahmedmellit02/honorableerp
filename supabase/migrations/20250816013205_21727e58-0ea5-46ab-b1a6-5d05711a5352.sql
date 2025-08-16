-- Fix security issues by setting search_path on functions
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.cash_in_sale(UUID);

-- Recreate get_user_role function with search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1;
$$;

-- Recreate cash_in_sale function with search_path
CREATE OR REPLACE FUNCTION public.cash_in_sale(sale_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow cashiers to cash in
  IF public.get_user_role(auth.uid()) != 'cashier' THEN
    RAISE EXCEPTION 'Only cashiers can cash in sales';
  END IF;
  
  UPDATE public.sales 
  SET 
    cashed_in = TRUE,
    cashed_in_at = NOW(),
    cashed_in_by = auth.uid()
  WHERE id = sale_id AND cashed_in = FALSE;
END;
$$;