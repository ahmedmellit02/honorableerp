CREATE OR REPLACE FUNCTION public.deduct_balance_on_sale()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  mapped_system TEXT;
BEGIN
  -- Map the system names from sales to balance_records format
  CASE NEW.system
    WHEN 'TTP' THEN mapped_system := 'Top Travel Trip (TTP)';
    WHEN 'AR' THEN mapped_system := 'Accelaero (AR)';
    WHEN 'Carte' THEN mapped_system := 'Carte';
    WHEN 'Top Travel Trip (TTP)' THEN mapped_system := 'Top Travel Trip (TTP)';
    WHEN 'Accelaero (AR)' THEN mapped_system := 'Accelaero (AR)';
    ELSE 
      -- Skip balance deduction for other systems like 'Divers'
      RETURN NEW;
  END CASE;
  
  -- Insert a deduction record for the purchase price
  INSERT INTO public.balance_records (
    user_id,
    system,
    amount,
    type,
    description
  ) VALUES (
    NEW.user_id,
    mapped_system,
    NEW.buying_price,
    'deduction',
    'Automatic deduction for sale #' || NEW.numeric_id || ' - ' || NEW.client_name
  );
  
  RETURN NEW;
END;
$function$