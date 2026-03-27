import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

  // Re-render every minute for countdown
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Find next class
  const now = new Date();
  const nextClass = entries.find((e) => {
    const [h, m] = e.startTime.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d > now;
  });

  const nextMins = nextClass ? getMinutesUntil(nextClass.startTime) : null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Today's Classes
          </CardTitle>
          {nextMins !== null && nextMins > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/30">
              <Clock className="h-3 w-3 mr-1" />
              Next class in {formatDuration(nextMins)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No classes scheduled today.</p>
        ) : (
          <>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="text-xs text-muted-foreground">Time</TableHead>
                    <TableHead className="text-xs text-muted-foreground">Subject</TableHead>
                    <TableHead className="text-xs text-muted-foreground">Duration</TableHead>
                    <TableHead className="text-xs text-muted-foreground">Location</TableHead>
                    <TableHead className="text-xs text-muted-foreground">Instructor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((e) => {
                    const mins = getMinutesUntil(e.startTime);
                    const isUpcoming = mins > 0;
                    const isOngoing = mins <= 0 && getMinutesUntil(e.endTime) > 0;

                    return (
                      <TableRow
                        key={e.id}
                        className={
                          isOngoing
                            ? 'bg-primary/5 border-l-2 border-l-primary'
                            : 'hover:bg-secondary/30'
                        }
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {e.startTime}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{e.courseName}</span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                e.isLab
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              }`}
                            >
                              {e.isLab ? 'Lab' : 'Lecture'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {isOngoing ? (
                            <span className="text-primary font-medium">Ongoing</span>
                          ) : isUpcoming ? (
                            formatDuration(mins)
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {e.roomName}
                          {e.floor != null && ` · Floor ${e.floor}`}
                          {e.building && ` · ${e.building}`}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{e.instructorName}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                This week: {totalWeeklyHours} hrs · {lectureCount} lectures · {labCount} labs · {tutorialCount} tutorials
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
