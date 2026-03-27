import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

export interface GridCell {
  courseName: string;
  isLab: boolean;
}

export interface WeeklyGridProps {
  /** Map of "day-slotOrder" → cell data */
  grid: Record<string, GridCell>;
  timeSlots: { id: string; label: string; slotOrder: number; isBreak: boolean }[];
  days: string[];
  summaryText?: string;
  loading?: boolean;
}

function getCellStyle(cell: GridCell | undefined) {
  if (!cell) return 'bg-secondary/30';
  if (cell.isLab) return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
  return 'bg-blue-500/15 text-blue-400 border border-blue-500/20';
}

export function WeeklyGrid({ grid, timeSlots, days, summaryText, loading }: WeeklyGridProps) {
  const activeSlots = timeSlots.filter((s) => !s.isBreak);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Weekly Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left text-muted-foreground p-1.5 w-20">Time</th>
                    {days.map((d) => (
                      <th key={d} className="text-center text-muted-foreground p-1.5 capitalize">
                        {d.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeSlots.map((slot) => (
                    <tr key={slot.id}>
                      <td className="text-muted-foreground p-1.5 font-mono whitespace-nowrap">{slot.label}</td>
                      {days.map((day) => {
                        const key = `${day}-${slot.slotOrder}`;
                        const cell = grid[key];
                        return (
                          <td key={key} className="p-1">
                            <div
                              className={`rounded-md px-1.5 py-1.5 text-center text-[10px] font-medium min-h-[28px] flex items-center justify-center ${getCellStyle(cell)}`}
                            >
                              {cell ? cell.courseName : ''}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {summaryText && (
              <p className="text-xs text-muted-foreground mt-3">{summaryText}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Lecture</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Lab</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
