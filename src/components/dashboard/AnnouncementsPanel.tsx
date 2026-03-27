import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useSystemAlerts } from '@/hooks/useSystemAlerts';
import { formatDistanceToNow } from 'date-fns';

function getAlertBadge(type: string) {
  switch (type) {
    case 'venue_booking':
      return { label: 'Event', className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    case 'urgent':
      return { label: 'Urgent', className: 'bg-red-500/10 text-red-400 border-red-500/30' };
    case 'room_change':
      return { label: 'Room change', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    case 'holiday':
      return { label: 'Holiday', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    default:
      return { label: 'Info', className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
  }
}

export function AnnouncementsPanel() {
  const { data: alerts = [], isLoading } = useSystemAlerts(10);

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        ) : (
          alerts.map((alert) => {
            const badge = getAlertBadge(alert.alert_type);
            return (
              <div key={alert.id} className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className={`text-[10px] ${badge.className}`}>
                      {badge.label}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
