-- Update sales by type aggregates to show current month data
DROP FUNCTION public.get_sales_by_type_aggregates();

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
  WHERE date_trunc('month', s.created_at AT TIME ZONE 'Africa/Casablanca') = date_trunc('month', now() AT TIME ZONE 'Africa/Casablanca')
  GROUP BY s.type
  ORDER BY count(*) DESC;
$function$

-- Update daily sales aggregates to show current month data
DROP FUNCTION public.get_sales_daily_aggregates();

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
  WHERE date_trunc('month', created_at AT TIME ZONE 'Africa/Casablanca') = date_trunc('month', now() AT TIME ZONE 'Africa/Casablanca')
  GROUP BY (created_at AT TIME ZONE 'Africa/Casablanca')::date
  ORDER BY (created_at AT TIME ZONE 'Africa/Casablanca')::date DESC;
$function$