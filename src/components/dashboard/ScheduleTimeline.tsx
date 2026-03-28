import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const TYPE_STYLES = {
  lecture: { dot: '#185FA5', bg: '#E6F1FB', text: '#0C447C', border: '#85B7EB', label: 'Lecture' },
  lab: { dot: '#3B6D11', bg: '#EAF3DE', text: '#27500A', border: '#97C459', label: 'Lab' },
  tutorial: { dot: '#854F0B', bg: '#FAEEDA', text: '#633806', border: '#EF9F27', label: 'Tutorial' },
};

function isNextClass(startTime: string): boolean {
  const now = new Date();
  const [h, m] = startTime.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d > now;
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
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 max-h-[420px] overflow-y-auto pr-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No classes scheduled today.</p>
        ) : (
          entries.map((e) => {
            if (e.isFree) {
              return (
                <div key={e.id} className="flex items-center gap-3 py-3 px-3 border-b border-border/50 opacity-50">
                  <span className="text-xs text-muted-foreground w-[72px] shrink-0 font-mono">
                    {e.startTime}–{e.endTime}
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 shrink-0" />
                  <span className="text-sm text-muted-foreground italic">Free period</span>
                </div>
              );
            }

            const type = e.isLab ? 'lab' : 'lecture';
            const styles = TYPE_STYLES[type];
            let isNext = false;
            if (!foundNext && isNextClass(e.startTime)) {
              foundNext = true;
              isNext = true;
            }

            return (
              <div
                key={e.id}
                className={`flex items-center gap-3 py-3 px-3 border-b border-border/50 transition-colors ${
                  isNext ? 'border-l-2' : ''
                }`}
                style={isNext ? { borderLeftColor: '#185FA5', background: 'rgba(24,95,165,0.05)' } : undefined}
              >
                <span className="text-xs text-muted-foreground w-[72px] shrink-0 font-mono">
                  {e.startTime}–{e.endTime}
                </span>
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: styles.dot }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{e.courseName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {e.batchName} · {e.roomName}
                    {e.roomCapacity ? ` (${e.roomCapacity})` : ''}
                  </p>
                  {isNext && (
                    <p className="text-[10px] font-medium mt-0.5" style={{ color: '#185FA5' }}>
                      Next class
                    </p>
                  )}
                </div>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 border"
                  style={{ background: styles.bg, color: styles.text, borderColor: styles.border }}
                >
                  {styles.label}
                </span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
