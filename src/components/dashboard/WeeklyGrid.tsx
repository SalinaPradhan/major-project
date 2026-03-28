import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { useState } from 'react';

export interface GridCell {
  courseName: string;
  isLab: boolean;
}

export interface WeeklyGridProps {
  grid: Record<string, GridCell>;
  timeSlots: { id: string; label: string; slotOrder: number; isBreak: boolean }[];
  days: string[];
  summaryText?: string;
  loading?: boolean;
  highlightToday?: boolean;
}

const CELL_STYLES = {
  lecture: { bg: '#E6F1FB', text: '#0C447C', border: '#85B7EB' },
  lab: { bg: '#EAF3DE', text: '#27500A', border: '#97C459' },
};

const EMPTY_STYLE = { bg: 'transparent', text: 'transparent', border: 'transparent' };

const DAY_INDEX: Record<string, number> = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
};

export function WeeklyGrid({ grid, timeSlots, days, summaryText, loading, highlightToday }: WeeklyGridProps) {
  const [_week, setWeek] = useState<'this' | 'next'>('this');
  const activeSlots = timeSlots.filter((s) => !s.isBreak);
  const todayIdx = new Date().getDay();

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Weekly Schedule
        </CardTitle>
        <div className="flex bg-secondary rounded-lg p-0.5 text-[11px]">
          {(['this', 'next'] as const).map((w) => (
            <button
              key={w}
              onClick={() => setWeek(w)}
              className={`px-3 py-1 rounded-md capitalize transition-colors ${
                _week === w ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {w} week
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div
                className="grid gap-[2px]"
                style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}
              >
                {/* Header row */}
                <div className="text-[10px] text-muted-foreground p-1" />
                {days.map((d) => {
                  const isToday = highlightToday && DAY_INDEX[d] === todayIdx;
                  return (
                    <div
                      key={d}
                      className={`text-[10px] text-center p-1 capitalize font-medium ${
                        isToday ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {d.slice(0, 3)}
                    </div>
                  );
                })}

                {/* Data rows */}
                {activeSlots.map((slot) => (
                  <>
                    <div key={`label-${slot.id}`} className="text-[10px] text-muted-foreground font-mono p-1 flex items-center">
                      {slot.label}
                    </div>
                    {days.map((day) => {
                      const key = `${day}-${slot.slotOrder}`;
                      const cell = grid[key];
                      const s = cell ? (cell.isLab ? CELL_STYLES.lab : CELL_STYLES.lecture) : EMPTY_STYLE;
                      const isToday = highlightToday && DAY_INDEX[day] === todayIdx;

                      return (
                        <div
                          key={key}
                          className={`rounded text-[10px] font-medium flex items-center justify-center min-h-[32px] border ${
                            isToday && !cell ? 'border-primary/30' : ''
                          }`}
                          style={
                            cell
                              ? { background: s.bg, color: s.text, borderColor: s.border }
                              : isToday
                              ? undefined
                              : { borderColor: 'transparent', background: 'hsl(var(--secondary) / 0.3)' }
                          }
                        >
                          {cell ? cell.courseName : ''}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#E6F1FB', border: '1px solid #85B7EB' }} /> Lecture
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#EAF3DE', border: '1px solid #97C459' }} /> Lab
              </span>
            </div>

            {summaryText && (
              <p className="text-[11px] text-muted-foreground mt-2">{summaryText}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
