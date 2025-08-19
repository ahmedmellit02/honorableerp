-- Fix function search path issues for get_sales_daily_aggregates
CREATE OR REPLACE FUNCTION public.get_sales_daily_aggregates()
 RETURNS TABLE(day date, sales bigint, revenue numeric, profit numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    (created_at AT TIME ZONE 'Africa/Casablanca')::date AS day,
    count(*) AS sales,
    COALESCE(sum(selling_price), 0)::numeric(12,2) AS revenue,
    COALESCE(sum(selling_price - buying_price), 0)::numeric(12,2) AS profit
  FROM public.sales
  WHERE date_trunc('month', created_at AT TIME ZONE 'Africa/Casablanca') = date_trunc('month', now() AT TIME ZONE 'Africa/Casablanca')
  GROUP BY (created_at AT TIME ZONE 'Africa/Casablanca')::date
  ORDER BY (created_at AT TIME ZONE 'Africa/Casablanca')::date DESC;
$function$