-- Add cash-in tracking columns to pelerin_payments
ALTER TABLE public.pelerin_payments
ADD COLUMN cashed_in_by_cashier uuid REFERENCES auth.users(id),
ADD COLUMN cashed_in_at_cashier timestamp with time zone,
ADD COLUMN cashed_in_by_manager uuid REFERENCES auth.users(id),
ADD COLUMN cashed_in_at_manager timestamp with time zone;

-- Create index for better query performance
CREATE INDEX idx_pelerin_payments_cashed_in ON public.pelerin_payments(cashed_in_by_cashier, cashed_in_by_manager);

-- Update RLS policy to allow cashiers to update their cash-in status
CREATE POLICY "Cashiers can mark payments as cashed in (cashier)"
ON public.pelerin_payments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'cashier'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'cashier'::app_role
  )
);

-- Update RLS policy to allow managers to update their cash-in status
CREATE POLICY "Managers can mark payments as cashed in (manager)"
ON public.pelerin_payments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'manager'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'manager'::app_role
  )
);