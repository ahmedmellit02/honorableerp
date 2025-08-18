-- Update the sales by type aggregates function to include profit
CREATE OR REPLACE FUNCTION public.get_sales_by_type_aggregates()
 RETURNS TABLE(type text, count bigint, revenue numeric, profit numeric)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT 
    s.type,
    count(*) AS count,
    COALESCE(sum(s.selling_price), 0)::numeric(12,2) AS revenue,
    COALESCE(sum(s.selling_price - s.buying_price), 0)::numeric(12,2) AS profit
  FROM public.sales s
  GROUP BY s.type
  ORDER BY count(*) DESC;
$function$