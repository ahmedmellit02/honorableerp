import { useState, useEffect } from 'react';
import { useProspects } from './useProspects';
import { useActivities } from './useActivities';
import { useQuotes } from './useQuotes';

export interface CRMMetrics {
  totalProspects: number;
  newProspectsThisMonth: number;
  prospectsByStatus: Record<string, number>;
  conversionRate: number;
  totalQuotes: number;
  activeQuotes: number;
  quotesByStatus: Record<string, number>;
  pipelineValue: number;
  wonDeals: number;
  avgDealSize: number;
  activitiesThisWeek: number;
  activitiesByType: Record<string, number>;
  upcomingFollowUps: number;
  monthlyGrowth: number;
}

export function useCRMMetrics() {
  const { prospects } = useProspects();
  const { activities, getUpcomingActivities } = useActivities();
  const { quotes, getTotalQuoteValue } = useQuotes();
  const [metrics, setMetrics] = useState<CRMMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (prospects.length >= 0 && activities.length >= 0 && quotes.length >= 0) {
      calculateMetrics();
      setLoading(false);
    }
  }, [prospects, activities, quotes]);

  const calculateMetrics = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Prospects metrics
    const totalProspects = prospects.length;
    const newProspectsThisMonth = prospects.filter(
      p => new Date(p.created_at) >= startOfMonth
    ).length;

    const prospectsByStatus = prospects.reduce((acc, prospect) => {
      acc[prospect.status] = (acc[prospect.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Conversion rate
    const wonProspects = prospectsByStatus['won'] || 0;
    const conversionRate = totalProspects > 0 ? (wonProspects / totalProspects) * 100 : 0;

    // Quotes metrics
    const totalQuotes = quotes.length;
    const activeQuotes = quotes.filter(
      q => q.status === 'draft' || q.status === 'sent'
    ).length;

    const quotesByStatus = quotes.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pipelineValue = getTotalQuoteValue();
    const wonDeals = quotes.filter(q => q.status === 'accepted').length;
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted');
    const avgDealSize = acceptedQuotes.length > 0 
      ? acceptedQuotes.reduce((sum, q) => sum + (q.total_amount || 0), 0) / acceptedQuotes.length
      : 0;

    // Activities metrics
    const activitiesThisWeek = activities.filter(
      a => new Date(a.created_at) >= startOfWeek
    ).length;

    const activitiesByType = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const upcomingFollowUps = getUpcomingActivities().length;

    // Growth calculation (comparing this month to last month)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const lastMonthProspects = prospects.filter(
      p => new Date(p.created_at) >= lastMonth && new Date(p.created_at) <= endOfLastMonth
    ).length;

    const monthlyGrowth = lastMonthProspects > 0 
      ? ((newProspectsThisMonth - lastMonthProspects) / lastMonthProspects) * 100
      : newProspectsThisMonth > 0 ? 100 : 0;

    setMetrics({
      totalProspects,
      newProspectsThisMonth,
      prospectsByStatus,
      conversionRate,
      totalQuotes,
      activeQuotes,
      quotesByStatus,
      pipelineValue,
      wonDeals,
      avgDealSize,
      activitiesThisWeek,
      activitiesByType,
      upcomingFollowUps,
      monthlyGrowth
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getMetricTrend = (value: number): 'up' | 'down' | 'neutral' => {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  return {
    metrics,
    loading,
    formatCurrency,
    getMetricTrend,
    refetch: calculateMetrics
  };
}