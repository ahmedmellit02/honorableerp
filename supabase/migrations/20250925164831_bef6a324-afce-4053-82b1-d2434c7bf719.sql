-- Reorder all numeric_id values to start from 8333
WITH ordered_sales AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY created_at) + 8332) as new_numeric_id
  FROM public.sales
  ORDER BY created_at
)
UPDATE public.sales 
SET numeric_id = ordered_sales.new_numeric_id
FROM ordered_sales
WHERE public.sales.id = ordered_sales.id;

-- Reset the sequence to continue from the highest number
SELECT setval('sales_numeric_id_seq', (SELECT MAX(numeric_id) FROM public.sales));