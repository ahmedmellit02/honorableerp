-- Update the get_current_debt_balance function to only consider pending records
CREATE OR REPLACE FUNCTION public.get_current_debt_balance()
 RETURNS TABLE(current_balance numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    SUM(
      CASE 
        WHEN type = 'credit' THEN amount 
        WHEN type = 'debit' THEN -amount 
        ELSE 0 
      END
    ), 0
  ) as current_balance
  FROM public.debt_records
  WHERE status = 'pending';
$function$