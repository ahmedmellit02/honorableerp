-- Fix function search path issues for get_sales_monthly_aggregates
CREATE OR REPLACE FUNCTION public.get_sales_monthly_aggregates()
 RETURNS TABLE(month date, sales bigint, revenue numeric, profit numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    (date_trunc('month', created_at))::date AS month,
    count(*) AS sales,
    COALESCE(sum(selling_price), 0)::numeric(12,2) AS revenue,
    COALESCE(sum(selling_price - buying_price), 0)::numeric(12,2) AS profit
  FROM public.sales
  GROUP BY (date_trunc('month', created_at))::date
  ORDER BY (date_trunc('month', created_at))::date;
$function$