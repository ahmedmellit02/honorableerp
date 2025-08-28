-- Create debt records table for agency credit/debt management
CREATE TABLE public.debt_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.debt_records ENABLE ROW LEVEL SECURITY;

-- Create policies for debt records
CREATE POLICY "Only cashiers can view debt records" 
ON public.debt_records 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'cashier'
));

CREATE POLICY "Only cashiers can insert debt records" 
ON public.debt_records 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'cashier'
) AND auth.uid() = user_id);

CREATE POLICY "Only cashiers can update debt records" 
ON public.debt_records 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'cashier'
) AND auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_debt_records_updated_at
BEFORE UPDATE ON public.debt_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get current debt balance
CREATE OR REPLACE FUNCTION public.get_current_debt_balance()
RETURNS TABLE(current_balance numeric)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    SUM(
      CASE 
        WHEN type = 'credit' THEN amount 
        WHEN type = 'debit' THEN -amount 
        ELSE 0 
      END
    ), 0
  ) as current_balance
  FROM public.debt_records;
$$;