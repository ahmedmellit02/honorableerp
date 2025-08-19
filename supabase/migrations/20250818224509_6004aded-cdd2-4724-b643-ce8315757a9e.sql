-- Update the handle_new_user_role function to assign roles based on email addresses
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Role assignments based on email addresses
    CASE NEW.email
        WHEN 'honorablevoyage@gmail.com' THEN
            INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'manager');
        WHEN 'm.elasri73@gmail.com', 'demo@agence.com' THEN
            INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'cashier');
        WHEN 'ahmedmellit02@gmail.com', 'mehdimellit@gmail.com' THEN
            INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_agent');
        WHEN 'achrafalarabi284@gmail.com', 'sanaeadam16@gmail.com' THEN
            INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'agent');
        ELSE
            -- Default role for new users
            INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'agent');
    END CASE;
    
    RETURN NEW;
END;
$$;

-- Create a function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = $1
    AND (
      -- Manager permissions
      (ur.role = 'manager' AND permission_name IN (
        'view_dashboard', 'view_daily_stats', 'view_monthly_stats', 
        'view_balance', 'view_daily_sales', 'view_top_services',
        'view_agent_performance', 'view_recent_sales'
      )) OR
      -- Cashier permissions (all manager permissions plus additional ones)
      (ur.role = 'cashier' AND permission_name IN (
        'view_dashboard', 'view_daily_stats', 'view_monthly_stats', 
        'view_balance', 'view_daily_sales', 'view_top_services',
        'view_agent_performance', 'view_recent_sales', 'add_sale',
        'cash_in_sale', 'control_balance'
      )) OR
      -- Super agent permissions (all manager and cashier except cash_in and control_balance)
      (ur.role = 'super_agent' AND permission_name IN (
        'view_dashboard', 'view_daily_stats', 'view_monthly_stats', 
        'view_balance', 'view_daily_sales', 'view_top_services',
        'view_agent_performance', 'view_recent_sales', 'add_sale'
      )) OR
      -- Agent permissions (limited dashboard access)
      (ur.role = 'agent' AND permission_name IN (
        'view_daily_stats', 'view_balance', 'view_daily_sales',
        'view_sales_by_type', 'view_top_services', 'view_agent_performance',
        'view_recent_sales', 'add_balance'
      )) OR
      -- Supplier permissions (system-specific access)
      (ur.role IN ('supplier_accelaero', 'supplier_ttp') AND permission_name IN (
        'view_supplier_balance', 'view_supplier_sales'
      ))
    )
  );
$$;