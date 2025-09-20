import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Mail, Calendar, FileText, MessageSquare, Clock } from 'lucide-react';

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'quote_sent' | 'follow_up';
  prospect_name: string;
  subject?: string;
  description: string;
  user_name: string;
  created_at: string;
  scheduled_at?: string;
  completed_at?: string;
}

interface ActivityFeedProps {
  limit?: number;
}

export function ActivityFeed({ limit }: ActivityFeedProps) {
  // Mock data - will be replaced with real data from hooks
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'call',
      prospect_name: 'Ahmed Benali',
      subject: 'Initial consultation call',
      description: 'Discussed travel requirements for business trip to Dubai. Interested in premium services.',
      user_name: 'Sarah Manager',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      completed_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: '2',
      type: 'email',
      prospect_name: 'Fatima El Mansouri',
      subject: 'Travel proposal sent',
      description: 'Sent detailed travel proposal for family vacation to Turkey including flights and accommodation.',
      user_name: 'Ahmed Agent',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: '3',
      type: 'follow_up',
      prospect_name: 'Mohammed Tazi',
      subject: 'Follow up on quote',
      description: 'Need to follow up on the Hajj package quote sent last week.',
      user_name: 'Youssef Super Agent',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      scheduled_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() // Tomorrow
    },
    {
      id: '4',
      type: 'meeting',
      prospect_name: 'Laila Benomar',
      subject: 'In-person consultation',
      description: 'Met with client to discuss honeymoon package to Maldives. Very interested, waiting for final decision.',
      user_name: 'Khadija Cashier',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
    },
    {
      id: '5',
      type: 'quote_sent',
      prospect_name: 'Omar Berrada',
      subject: 'Corporate travel quote',
      description: 'Sent comprehensive quote for company team building trip to Marrakech for 25 employees.',
      user_name: 'Sarah Manager',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
    }
  ];

  const getActivityIcon = (type: string) => {
    const icons = {
      call: Phone,
      email: Mail,
      meeting: Calendar,
      note: MessageSquare,
      quote_sent: FileText,
      follow_up: Clock
    };
    const Icon = icons[type as keyof typeof icons] || MessageSquare;
    return <Icon className="h-4 w-4" />;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      call: 'bg-blue-100 text-blue-600',
      email: 'bg-green-100 text-green-600',
      meeting: 'bg-purple-100 text-purple-600',
      note: 'bg-gray-100 text-gray-600',
      quote_sent: 'bg-orange-100 text-orange-600',
      follow_up: 'bg-yellow-100 text-yellow-600'
    };
    return colors[type as keyof typeof colors] || colors.note;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const activities = limit ? mockActivities.slice(0, limit) : mockActivities;

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Aucune activité pour le moment</p>
          </CardContent>
        </Card>
      ) : (
        activities.map((activity) => (
          <Card key={activity.id} className="p-4">
            <div className="flex gap-4">
              <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.prospect_name}</span>
                       <Badge variant="outline" className="text-xs">
                         {(() => {
                           switch (activity.type) {
                             case 'call': return 'APPEL';
                             case 'email': return 'EMAIL';
                             case 'meeting': return 'RÉUNION';
                             case 'note': return 'NOTE';
                             case 'quote_sent': return 'DEVIS ENVOYÉ';
                             case 'follow_up': return 'SUIVI';
                             default: return (activity.type as string).replace('_', ' ').toUpperCase();
                           }
                         })()}
                       </Badge>
                    </div>
                    {activity.subject && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.subject}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(activity.created_at)}
                  </span>
                </div>
                
                <p className="text-sm">{activity.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {activity.user_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.user_name}
                    </span>
                  </div>
                  
                  {activity.scheduled_at && !activity.completed_at && (
                    <Badge variant="outline" className="text-xs">
                      Programmé: {new Date(activity.scheduled_at).toLocaleDateString('fr-FR')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}