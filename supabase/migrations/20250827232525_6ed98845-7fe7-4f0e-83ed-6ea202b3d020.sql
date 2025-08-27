-- Create timezone-aware RPC functions for expenses
-- These functions handle timezone conversion to Africa/Casablanca like the sales functions

-- Function to get daily expenses total (approved only)
CREATE OR REPLACE FUNCTION get_expenses_daily_total()
RETURNS TABLE (total_expenses NUMERIC)
LANGUAGE plpgsql
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