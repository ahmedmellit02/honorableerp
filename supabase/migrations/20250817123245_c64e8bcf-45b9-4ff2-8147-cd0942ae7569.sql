-- Drop the existing security definer views and replace with secure functions
DROP VIEW IF EXISTS public.sales_monthly_aggregates;
DROP VIEW IF EXISTS public.sales_by_type_aggregates;

-- Create secure function for monthly sales aggregates
CREATE OR REPLACE FUNCTION public.get_sales_monthly_aggregates()
RETURNS TABLE(month DATE, sales BIGINT, revenue NUMERIC, profit NUMERIC)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT 
    (date_trunc('month', created_at))::date AS month,
    count(*) AS sales,
    COALESCE(sum(selling_price), 0)::numeric(12,2) AS revenue,
    COALESCE(sum(selling_price - buying_price), 0)::numeric(12,2) AS profit
  FROM public.sales
  GROUP BY (date_trunc('month', created_at))::date
  ORDER BY (date_trunc('month', created_at))::date;
$$;

-- Create secure function for sales by type aggregates
CREATE OR REPLACE FUNCTION public.get_sales_by_type_aggregates()
RETURNS TABLE(type TEXT, count BIGINT, revenue NUMERIC)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT 
    s.type,
    count(*) AS count,
    COALESCE(sum(s.selling_price), 0)::numeric(12,2) AS revenue
  FROM public.sales s
  GROUP BY s.type
  ORDER BY count(*) DESC;
$$;