-- Add negative_profit_reason column to sales table
ALTER TABLE public.sales 
ADD COLUMN negative_profit_reason TEXT NULL;

-- Add comment to explain the column purpose
COMMENT ON COLUMN public.sales.negative_profit_reason IS 'Explanation provided by agent when profit is negative';