-- Update specific sales to mark them as bank transfer payments
UPDATE public.sales 
SET payment_method = 'V' 
WHERE numeric_id IN (8341, 8342);

-- Add a comment for tracking
COMMENT ON COLUMN public.sales.payment_method IS 'Payment method: C for Cash, V for Virement (Bank Transfer). Updated sales #8341 and #8342 to V on 2025-01-15';