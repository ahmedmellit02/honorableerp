-- Add a numeric ID column to sales table
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS numeric_id SERIAL;

-- Create a unique index on numeric_id
CREATE UNIQUE INDEX IF NOT EXISTS sales_numeric_id_idx ON public.sales(numeric_id);

-- Add comment for the new column
COMMENT ON COLUMN public.sales.numeric_id IS 'Sequential numeric ID for display purposes';