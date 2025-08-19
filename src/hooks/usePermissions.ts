import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type Permission = 
  | 'view_dashboard'
  | 'view_daily_stats'
  | 'view_monthly_stats'
  | 'view_balance'
  | 'view_daily_sales'
  | 'view_top_services'
  | 'view_agent_performance'
  | 'view_recent_sales'
  | 'add_sale'
  | 'cash_in_sale'
  | 'control_balance'
  | 'view_sales_by_type'
  | 'add_balance'
  | 'view_supplier_balance'
  | 'view_supplier_sales';

export type UserRole = 
  | 'manager'
  | 'cashier'
  | 'super_agent'
  | 'agent'
  | 'supplier_accelaero'
  | 'supplier_ttp';

export const usePermissions = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        } else {
          setUserRole(data.role as UserRole);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    if (!userRole) return false;

    const rolePermissions: Record<UserRole, Permission[]> = {
      manager: [
        'view_dashboard',
        'view_daily_stats',
        'view_monthly_stats',
        'view_balance',
        'view_daily_sales',
        'view_top_services',
        'view_agent_performance',
        'view_recent_sales'
      ],
      cashier: [
        'view_dashboard',
        'view_daily_stats',
        'view_monthly_stats',
        'view_balance',
        'view_daily_sales',
        'view_top_services',
        'view_agent_performance',
        'view_recent_sales',
        'add_sale',
        'cash_in_sale',
        'control_balance'
      ],
      super_agent: [
        'view_dashboard',
        'view_daily_stats',
        'view_monthly_stats',
        'view_balance',
        'view_daily_sales',
        'view_top_services',
        'view_agent_performance',
        'view_recent_sales',
        'add_sale'
      ],
      agent: [
        'view_daily_stats',
        'view_balance',
        'view_daily_sales',
        'view_sales_by_type',
        'view_top_services',
        'view_agent_performance',
        'view_recent_sales',
        'add_balance'
      ],
      supplier_accelaero: [
        'view_supplier_balance',
        'view_supplier_sales'
      ],
      supplier_ttp: [
        'view_supplier_balance',
        'view_supplier_sales'
      ]
    };

    return rolePermissions[userRole]?.includes(permission) || false;
  };

  const canAccessAddSale = (): boolean => {
    return hasPermission('add_sale');
  };

  const canAccessBalanceControl = (): boolean => {
    return hasPermission('control_balance');
  };

  const canCashIn = (): boolean => {
    return hasPermission('cash_in_sale');
  };

  const isSupplier = (): boolean => {
    return userRole === 'supplier_accelaero' || userRole === 'supplier_ttp';
  };

  const getSupplierSystem = (): string | null => {
    if (userRole === 'supplier_accelaero') return 'Accelaero (AR)';
    if (userRole === 'supplier_ttp') return 'Top Travel Trip (TTP)';
    return null;
  };

  return {
    userRole,
    loading,
    hasPermission,
    canAccessAddSale,
    canAccessBalanceControl,
    canCashIn,
    isSupplier,
    getSupplierSystem
  };
};