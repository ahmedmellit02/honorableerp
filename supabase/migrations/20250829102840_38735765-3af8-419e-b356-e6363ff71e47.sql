-- Add status field to debt_records table
ALTER TABLE public.debt_records 
ADD COLUMN status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'paid'));

-- Add indexes for better performance
CREATE INDEX idx_debt_records_status ON public.debt_records(status);
CREATE INDEX idx_debt_records_type_status ON public.debt_records(type, status);