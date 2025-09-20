import { usePermissions } from '@/hooks/usePermissions';
import { useCRMMetrics } from '@/hooks/useCRMMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, FileText, DollarSign, Activity, Calendar, Target } from 'lucide-react';

export function CRMMetrics() {
  const { hasPermission, userRole } = usePermissions();
  const { metrics, loading } = useCRMMetrics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getMetricCards = () => {
    if (loading || !metrics) {
      return [
        {
          title: 'Total Prospects',
          value: '...',
          description: 'Chargement...',
          icon: Users,
          trend: 'neutral' as const,
          show: hasPermission('view_crm_analytics') || hasPermission('view_assigned_prospects')
        },
        {
          title: 'Devis Actifs',
          value: '...',
          description: 'Chargement...',
          icon: FileText,
          trend: 'neutral' as const,
          show: hasPermission('create_quotes')
        },
        {
          title: 'Valeur Pipeline',
          value: '...',
          description: 'Chargement...',
          icon: DollarSign,
          trend: 'neutral' as const,
          show: hasPermission('view_crm_analytics')
        },
        {
          title: 'Taux de Conversion',
          value: '...',
          description: 'Chargement...',
          icon: Target,
          trend: 'neutral' as const,
          show: hasPermission('view_crm_analytics')
        }
      ].filter(card => card.show);
    }

    const baseCards: Array<{
      title: string;
      value: string;
      description: string;
      icon: any;
      trend: 'up' | 'down' | 'neutral';
      show: boolean;
    }> = [
      {
        title: 'Total Prospects',
        value: metrics.totalProspects.toString(),
        description: `+${metrics.newThisMonth} ce mois`,
        icon: Users,
        trend: 'up',
        show: hasPermission('view_crm_analytics') || hasPermission('view_assigned_prospects')
      },
      {
        title: 'Devis Actifs',
        value: metrics.activeQuotes.toString(),
        description: `${metrics.totalQuotes} devis total`,
        icon: FileText,
        trend: 'up',
        show: hasPermission('create_quotes')
      },
      {
        title: 'Valeur Pipeline',
        value: formatCurrency(metrics.pipelineValue),
        description: `Moy: ${formatCurrency(metrics.avgDealSize)}`,
        icon: DollarSign,
        trend: 'up',
        show: hasPermission('view_crm_analytics')
      },
      {
        title: 'Taux de Conversion',
        value: `${metrics.conversionRate.toFixed(1)}%`,
        description: `${metrics.wonDeals} affaires gagnées`,
        icon: Target,
        trend: 'up',
        show: hasPermission('view_crm_analytics')
      }
    ];

    const agentCards: Array<{
      title: string;
      value: string;
      description: string;
      icon: any;
      trend: 'up' | 'down' | 'neutral';
      show: boolean;
    }> = [
      {
        title: 'Mes Prospects',
        value: metrics.myProspects.toString(),
        description: `+${metrics.myNewThisWeek} cette semaine`,
        icon: Users,
        trend: 'up',
        show: userRole === 'agent' || userRole === 'super_agent'
      },
      {
        title: 'Mes Activités',
        value: metrics.activitiesThisWeek.toString(),
        description: 'Cette semaine',
        icon: Activity,
        trend: 'up',
        show: true
      },
      {
        title: 'Suivis à Faire',
        value: metrics.upcomingFollowUps.toString(),
        description: '7 prochains jours',
        icon: Calendar,
        trend: 'neutral',
        show: true
      }
    ];

    if (hasPermission('view_all_prospects')) {
      return baseCards.filter(card => card.show);
    } else {
      return [...baseCards.filter(card => card.show), ...agentCards.filter(card => card.show)];
    }
  };

  const metricCards = getMetricCards();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {metric.trend === 'up' && (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>{metric.description}</span>
              </div>
            )}
            {metric.trend === 'down' && (
              <div className="flex items-center gap-1 text-red-600">
                <TrendingDown className="h-3 w-3" />
                <span>{metric.description}</span>
              </div>
            )}
            {metric.trend === 'neutral' && (
              <span>{metric.description}</span>
            )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}