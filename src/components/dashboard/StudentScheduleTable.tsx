import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface StudentClassEntry {
  id: string;
  startTime: string;
  endTime: string;
  courseName: string;
  roomName: string;
  floor?: number | null;
  building?: string | null;
  instructorName: string;
  isLab: boolean;
}

const TYPE_STYLES = {
  lecture: { dot: '#185FA5', bg: '#E6F1FB', text: '#0C447C', border: '#85B7EB', label: 'Lecture' },
  lab: { dot: '#3B6D11', bg: '#EAF3DE', text: '#27500A', border: '#97C459', label: 'Lab' },
};

function getMinutesUntil(timeStr: string): number {
  const now = new Date();
  const [h, m] = timeStr.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 60000);
}

function formatDuration(mins: number): string {
  if (mins <= 0) return 'Ongoing';
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

interface StudentScheduleTableProps {
  entries: StudentClassEntry[];
  totalWeeklyHours: number;
  lectureCount: number;
  labCount: number;
  tutorialCount: number;
  loading?: boolean;
}

export function StudentScheduleTable({
  entries,
  totalWeeklyHours,
  lectureCount,
  labCount,
  tutorialCount,
  loading,
}: StudentScheduleTableProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  let foundNext = false;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Today's Classes
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No classes scheduled today.</p>
        ) : (
          <>
            {entries.map((e) => {
              const mins = getMinutesUntil(e.startTime);
              const [h, m] = e.startTime.split(':').map(Number);
              const startDate = new Date();
              startDate.setHours(h, m, 0, 0);
              const isUpcoming = startDate > now;
              let isNext = false;
              if (!foundNext && isUpcoming) {
                foundNext = true;
                isNext = true;
              }

              const type = e.isLab ? 'lab' : 'lecture';
              const styles = TYPE_STYLES[type];

              return (
                <div
                  key={e.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                    isNext ? 'border-l-2' : 'border-border'
                  }`}
                  style={isNext ? { borderLeftColor: '#185FA5', background: 'rgba(24,95,165,0.05)' } : undefined}
                >
                  {/* Time column */}
                  <div className="flex flex-col items-center w-[48px] shrink-0">
                    <span className="text-xs font-mono text-foreground">{e.startTime}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{e.endTime}</span>
                  </div>

                  {/* Dot */}
                  <div
                    className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: styles.dot }}
                  />

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{e.courseName}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {e.instructorName} · {e.roomName}
                      {e.floor != null && ` · Floor ${e.floor}`}
                      {e.building && ` · ${e.building}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                        style={{ background: styles.bg, color: styles.text, borderColor: styles.border }}
                      >
                        {styles.label}
                      </span>
                      {isNext && (
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: '#E6F1FB', color: '#185FA5' }}
                        >
                          <Clock className="inline h-2.5 w-2.5 mr-0.5" />
                          Next · {formatDuration(mins)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <p className="text-[11px] text-muted-foreground mt-2">
              This week: {totalWeeklyHours} hrs · {lectureCount} lectures · {labCount} labs · {tutorialCount} tutorials
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
