-- Drop the existing view that's causing security issues
DROP VIEW IF EXISTS public.system_balances;

-- Create a secure function to get system balances instead of using a view
CREATE OR REPLACE FUNCTION public.get_all_system_balances()
RETURNS TABLE(system TEXT, current_balance NUMERIC)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT 
    br.system,
    COALESCE(SUM(
      CASE 
        WHEN br.type = 'addition' THEN br.amount 
        WHEN br.type = 'deduction' THEN -br.amount 
        ELSE 0 
      END
    ), 0) as current_balance
  FROM public.balance_records br
  GROUP BY br.system;
$$;

-- Update the existing get_system_balance function to also be SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.get_system_balance(system_name TEXT)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    SUM(
      CASE 
        WHEN type = 'addition' THEN amount 
        WHEN type = 'deduction' THEN -amount 
        ELSE 0 
      END
    ), 0
  )
  FROM public.balance_records
  WHERE system = system_name;
$$;