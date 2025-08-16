-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('agent', 'cashier');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'agent',
    UNIQUE (user_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1;
$$;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add payment tracking to sales table
ALTER TABLE public.sales ADD COLUMN cashed_in BOOLEAN DEFAULT FALSE;
ALTER TABLE public.sales ADD COLUMN cashed_in_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.sales ADD COLUMN cashed_in_by UUID REFERENCES auth.users(id);

-- Create function to handle cashing in
CREATE OR REPLACE FUNCTION public.cash_in_sale(sale_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
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