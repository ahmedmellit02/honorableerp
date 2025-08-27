-- Fix security warnings by adding proper search_path to expense functions
-- Update the expense RPC functions to include SECURITY DEFINER and search_path

DROP FUNCTION IF EXISTS get_expenses_daily_total();
DROP FUNCTION IF EXISTS get_expenses_monthly_total();  
DROP FUNCTION IF EXISTS get_unapproved_expenses_daily_count();
DROP FUNCTION IF EXISTS get_unapproved_expenses_monthly_count();

-- Function to get daily expenses total (approved only)
CREATE OR REPLACE FUNCTION get_expenses_daily_total()
RETURNS TABLE (total_expenses NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(SUM(amount), 0) as total_expenses
  FROM expenses
  WHERE DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Casablanca') = CURRENT_DATE
    AND approved = true;
END;
$$;

-- Function to get monthly expenses total (approved only)
CREATE OR REPLACE FUNCTION get_expenses_monthly_total()
RETURNS TABLE (total_expenses NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(SUM(amount), 0) as total_expenses
  FROM expenses
  WHERE DATE_TRUNC('month', created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Casablanca') = 
        DATE_TRUNC('month', CURRENT_DATE)
    AND approved = true;
END;
$$;

-- Function to get daily unapproved expenses count
CREATE OR REPLACE FUNCTION get_unapproved_expenses_daily_count()
RETURNS TABLE (count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*) as count
  FROM expenses
  WHERE DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Casablanca') = CURRENT_DATE
    AND approved = false;
END;
$$;

-- Function to get monthly unapproved expenses count
CREATE OR REPLACE FUNCTION get_unapproved_expenses_monthly_count()
RETURNS TABLE (count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*) as count
  FROM expenses
  WHERE DATE_TRUNC('month', created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Casablanca') = 
        DATE_TRUNC('month', CURRENT_DATE)
    AND approved = false;
END;
$$;