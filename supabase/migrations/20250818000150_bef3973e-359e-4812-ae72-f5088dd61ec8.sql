-- Update the daily aggregates function to use Morocco timezone
CREATE OR REPLACE FUNCTION public.get_sales_daily_aggregates()
 RETURNS TABLE(day date, sales bigint, revenue numeric, profit numeric)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT 
    (created_at AT TIME ZONE 'Africa/Casablanca')::date AS day,
    count(*) AS sales,
    COALESCE(sum(selling_price), 0)::numeric(12,2) AS revenue,
    COALESCE(sum(selling_price - buying_price), 0)::numeric(12,2) AS profit
  FROM public.sales
  GROUP BY (created_at AT TIME ZONE 'Africa/Casablanca')::date
  ORDER BY (created_at AT TIME ZONE 'Africa/Casablanca')::date DESC;
$function$