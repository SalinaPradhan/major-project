import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { useSystemAlerts } from '@/hooks/useSystemAlerts';
import { formatDistanceToNow } from 'date-fns';

const ALERT_STYLES: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  venue_booking: { dot: '#185FA5', bg: '#E6F1FB', text: '#0C447C', label: 'Event' },
  urgent: { dot: '#E24B4A', bg: '#FCEBEB', text: '#791F1F', label: 'Urgent' },
  room_change: { dot: '#185FA5', bg: '#E6F1FB', text: '#0C447C', label: 'Room change' },
  holiday: { dot: '#3B6D11', bg: '#EAF3DE', text: '#27500A', label: 'Holiday' },
  info: { dot: '#185FA5', bg: '#E6F1FB', text: '#0C447C', label: 'Info' },
};

export function AnnouncementsPanel() {
  const { data: alerts = [], isLoading } = useSystemAlerts(10);

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 max-h-[380px] overflow-y-auto pr-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        ) : (
          alerts.map((alert) => {
            const style = ALERT_STYLES[alert.alert_type] || ALERT_STYLES.info;
            return (
              <div key={alert.id} className="flex items-start gap-3 py-2.5 px-3 border-b border-border/50">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: style.dot }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: style.bg, color: style.text }}
                    >
                      {style.label}
                    </span>
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
