import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export type UserRole = 'manager' | 'cashier' | 'super_agent' | 'agent';

export const useSimpleRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const determineRole = () => {
      if (!user?.email) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      // Simple email-to-role mapping for immediate functionality
      const emailToRole: Record<string, UserRole> = {
        'honorablevoyage@gmail.com': 'manager',
        'm.elasri73@gmail.com': 'cashier',
        'demo@agence.com': 'cashier',
        'ahmedmellit02@gmail.com': 'super_agent',
        'mehdimellit@gmail.com': 'super_agent',
        'achrafalarabi284@gmail.com': 'agent',
        'sanaeadam16@gmail.com': 'agent'
      };

      const role = emailToRole[user.email] || 'agent';
      setUserRole(role);
      setLoading(false);
      
      console.log('Simple role determined:', { email: user.email, role });
    };

    determineRole();
  }, [user?.email]);

  // Permission checks based on role
  const canViewDashboard = (): boolean => {
    return userRole === 'manager' || userRole === 'cashier' || userRole === 'super_agent' || userRole === 'agent';
  };

  const canAddSale = (): boolean => {
    return userRole === 'cashier' || userRole === 'super_agent';
  };

  const canControlBalance = (): boolean => {
    return userRole === 'cashier';
  };

  const canCashIn = (): boolean => {
    return userRole === 'cashier';
  };

  const canViewMonthlyStats = (): boolean => {
    return userRole === 'manager' || userRole === 'cashier' || userRole === 'super_agent';
  };

  return {
    userRole,
    loading,
    canViewDashboard,
    canAddSale,
    canControlBalance,
    canCashIn,
    canViewMonthlyStats
  };
};