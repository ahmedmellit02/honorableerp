-- Add bank_transfer_confirmed field to track manager confirmation separately from final cash-in
ALTER TABLE public.sales 
ADD COLUMN bank_transfer_confirmed BOOLEAN DEFAULT FALSE;

-- Update the confirm_bank_transfer function to set bank_transfer_confirmed instead of cashed_in
CREATE OR REPLACE FUNCTION public.confirm_bank_transfer(sale_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow managers to confirm bank transfers
  IF public.get_user_role(auth.uid()) != 'manager' THEN
    RAISE EXCEPTION 'Only managers can confirm bank transfer payments';
  END IF;
  
  UPDATE public.sales 
  SET 
    bank_transfer_confirmed = TRUE,
    cashed_in_at = NOW(),
    cashed_in_by = auth.uid()
  WHERE id = sale_id 
    AND payment_method = 'V' 
    AND bank_transfer_confirmed = FALSE;
END;
$function$;

-- Update the cash_in_sale function to allow cashing in V sales that have been confirmed
CREATE OR REPLACE FUNCTION public.cash_in_sale(sale_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  WHERE id = sale_id 
    AND cashed_in = FALSE
    AND (
      payment_method = 'C' OR 
      (payment_method = 'V' AND bank_transfer_confirmed = TRUE)
    );
END;
$function$;