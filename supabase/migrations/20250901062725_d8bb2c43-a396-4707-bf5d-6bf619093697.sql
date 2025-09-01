-- Clear all testing data from the database
-- This will delete all records but keep the table structures intact

-- Clear all sales data
DELETE FROM public.sales;

-- Clear all expenses data  
DELETE FROM public.expenses;

-- Clear all balance records
DELETE FROM public.balance_records;

-- Clear all debt records
DELETE FROM public.debt_records;

-- Clear all notifications
DELETE FROM public.notifications;

-- Reset the sales numeric_id sequence to start from 1
ALTER SEQUENCE sales_numeric_id_seq RESTART WITH 1;

-- Note: Keeping app_settings and user_roles intact
-- If you want to clear user roles as well, uncomment the next line:
-- DELETE FROM public.user_roles;