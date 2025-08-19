import { useState } from 'react';
import { Bell, Check, Clock, Plane, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationRead, type Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const { data: notifications = [] } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    return type === 'flight' ? (
      <Plane className="h-4 w-4 text-blue-500" />
    ) : (
      <Calendar className="h-4 w-4 text-green-500" />
    );
  };

  const getNotificationBadgeColor = (type: string, isRead: boolean) => {
    if (isRead) return 'secondary';
    return type === 'flight' ? 'destructive' : 'default';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} non lues
            </Badge>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    notification.is_read 
                      ? "bg-muted/30 hover:bg-muted/50" 
                      : "bg-accent/50 hover:bg-accent/80",
                    "border border-border/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm leading-relaxed",
                      notification.is_read ? "text-muted-foreground" : "text-foreground font-medium"
                    )}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant={getNotificationBadgeColor(notification.notification_type, notification.is_read)}
                        className="text-xs"
                      >
                        {notification.notification_type === 'flight' ? 'Vol' : 'RW'}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {notification.is_read && (
                        <Check className="h-3 w-3 text-green-500 ml-auto" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}