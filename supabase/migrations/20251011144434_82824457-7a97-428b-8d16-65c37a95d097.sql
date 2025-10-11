-- Add encaissement tracking fields for advance payment to pelerins table
ALTER TABLE public.pelerins 
ADD COLUMN advance_cashed_in_by_cashier uuid REFERENCES auth.users(id),
ADD COLUMN advance_cashed_in_at_cashier timestamp with time zone,
ADD COLUMN advance_cashed_in_by_manager uuid REFERENCES auth.users(id),
ADD COLUMN advance_cashed_in_at_manager timestamp with time zone;