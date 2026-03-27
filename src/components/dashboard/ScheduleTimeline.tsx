import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

export interface TimelineEntry {
  id: string;
  startTime: string;
  endTime: string;
  courseName: string;
  batchName: string;
  roomName: string;
  roomCapacity?: number;
  isLab: boolean;
  isFree?: boolean;
}

function getTypeLabel(isLab: boolean) {
  return isLab ? 'Lab' : 'Lecture';
}

function getTypeStyles(isLab: boolean) {
  if (isLab) return { dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  return { dot: 'bg-blue-400', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
}

function isNextClass(startTime: string): boolean {
  const now = new Date();
  const [h, m] = startTime.split(':').map(Number);
  const slotDate = new Date();
  slotDate.setHours(h, m, 0, 0);
  return slotDate > now;
}

interface ScheduleTimelineProps {
  entries: TimelineEntry[];
  loading?: boolean;
}

export function ScheduleTimeline({ entries, loading }: ScheduleTimelineProps) {
  let foundNext = false;

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 max-h-[420px] overflow-y-auto pr-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No classes scheduled today.</p>
        ) : (
          entries.map((e) => {
            if (e.isFree) {
              return (
                <div key={e.id} className="flex items-center gap-3 py-2 px-3 rounded-lg">
                  <span className="text-xs text-muted-foreground w-24 shrink-0 font-mono">
                    {e.startTime}–{e.endTime}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  <span className="text-sm text-muted-foreground italic">Free period</span>
                </div>
              );
            }

            const styles = getTypeStyles(e.isLab);
            let isNext = false;
            if (!foundNext && isNextClass(e.startTime)) {
              foundNext = true;
              isNext = true;
            }

            return (
              <div
                key={e.id}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                  isNext ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-secondary/50'
                }`}
              >
                <span className="text-xs text-muted-foreground w-24 shrink-0 font-mono">
                  {e.startTime}–{e.endTime}
                </span>
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${styles.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {e.courseName}
                    <span className="text-muted-foreground font-normal"> · {e.batchName} · {e.roomName}</span>
                  </p>
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${styles.badge}`}>
                  {getTypeLabel(e.isLab)}
                </Badge>
                {isNext && (
                  <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30 shrink-0">
                    Next
                  </Badge>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
