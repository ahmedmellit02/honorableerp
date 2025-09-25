-- Delete sales #8424 and #8445
DELETE FROM public.sales WHERE numeric_id IN (8424, 8445);

-- Reorder all numeric_id values to be consecutive starting from 1
WITH ordered_sales AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_numeric_id
  FROM public.sales
  ORDER BY created_at
)
UPDATE public.sales 
SET numeric_id = ordered_sales.new_numeric_id
FROM ordered_sales
WHERE public.sales.id = ordered_sales.id;

-- Reset the sequence to continue from the highest number
SELECT setval('sales_numeric_id_seq', (SELECT MAX(numeric_id) FROM public.sales));