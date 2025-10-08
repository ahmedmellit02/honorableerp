-- Create pelerin_payments table to track individual payments
CREATE TABLE public.pelerin_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pelerin_id UUID NOT NULL REFERENCES public.pelerins(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pelerin_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "All authenticated users can view pelerin payments"
  ON public.pelerin_payments
  FOR SELECT
  USING (true);

CREATE POLICY "Managers and super agents can insert pelerin payments"
  ON public.pelerin_payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('manager', 'super_agent')
    )
    AND auth.uid() = created_by
  );

-- Create index for faster queries
CREATE INDEX idx_pelerin_payments_pelerin_id ON public.pelerin_payments(pelerin_id);

-- Migrate existing advance_payment data as first payment for each pelerin
INSERT INTO public.pelerin_payments (pelerin_id, amount, payment_date, description, created_by, created_at)
SELECT 
  id,
  advance_payment,
  created_at,
  'Paiement initial',
  created_by,
  created_at
FROM public.pelerins
WHERE advance_payment > 0;