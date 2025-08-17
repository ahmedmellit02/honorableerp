-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create balance_records table for tracking system balances
CREATE TABLE public.balance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  system TEXT NOT NULL CHECK (system IN ('Top Travel Trip (TTP)', 'Accelaero (AR)')),
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('addition', 'deduction')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.balance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for balance_records
CREATE POLICY "All authenticated users can view balance records" 
ON public.balance_records 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert balance records" 
ON public.balance_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance records" 
ON public.balance_records 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_balance_records_updated_at
BEFORE UPDATE ON public.balance_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create view for current balances by system
CREATE OR REPLACE VIEW public.system_balances AS
SELECT 
  system,
  COALESCE(SUM(
    CASE 
      WHEN type = 'addition' THEN amount 
      WHEN type = 'deduction' THEN -amount 
      ELSE 0 
    END
  ), 0) as current_balance
FROM public.balance_records
GROUP BY system;

-- Create function to get current balance for a system
CREATE OR REPLACE FUNCTION public.get_system_balance(system_name TEXT)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(current_balance, 0)
  FROM public.system_balances
  WHERE system = system_name;
$$;

-- Create function to deduct balance automatically on sale creation
CREATE OR REPLACE FUNCTION public.deduct_balance_on_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert a deduction record for the purchase price
  INSERT INTO public.balance_records (
    user_id,
    system,
    amount,
    type,
    description
  ) VALUES (
    NEW.user_id,
    NEW.system,
    NEW.buying_price,
    'deduction',
    'Automatic deduction for sale #' || NEW.numeric_id || ' - ' || NEW.client_name
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically deduct balance when a sale is created
CREATE TRIGGER auto_deduct_balance_on_sale
AFTER INSERT ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.deduct_balance_on_sale();