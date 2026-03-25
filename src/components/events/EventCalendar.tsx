import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Event } from '@/hooks/useEvents';

interface EventCalendarProps {
  events: Event[];
  onDateClick?: (date: string) => void;
  onBookClick?: (date: string) => void;
  onEditClick?: (event: Event) => void;
  onDeleteClick?: (id: string) => void;
  readOnly?: boolean;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  exam: 'hsl(0, 84%, 60%)',
  seminar: 'hsl(221, 83%, 53%)',
  workshop: 'hsl(38, 92%, 50%)',
  meeting: 'hsl(142, 71%, 45%)',
  other: 'hsl(240, 5%, 65%)',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  exam: 'Exam',
  seminar: 'Seminar',
  workshop: 'Workshop',
  meeting: 'Meeting',
  other: 'Other',
};

const EVENT_TYPE_BG: Record<string, string> = {
  exam: 'bg-destructive/5 border-destructive/20',
  seminar: 'bg-primary/5 border-primary/20',
  workshop: 'bg-accent/30 border-accent',
  meeting: 'bg-secondary/50 border-secondary',
  other: 'bg-muted/50 border-muted',
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function EventCalendar({ events, onBookClick, onEditClick, onDeleteClick, readOnly = false }: EventCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const eventsByDate = useMemo(() => {
    const map: Record<string, Event[]> = {};
    events.forEach(ev => {
      const d = new Date(ev.event_date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        if (!map[ev.event_date]) map[ev.event_date] = [];
        map[ev.event_date].push(ev);
      }
    });
    return map;
  }, [events, currentMonth, currentYear]);

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setDialogOpen(true);
  };

  const selectedDateEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: EVENT_TYPE_COLORS[type] }}
            />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-card/40 p-2 min-h-[80px]" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = eventsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;

          return (
            <div
              key={day}
              onClick={() => handleDateClick(day)}
              className={cn(
                "bg-card p-1.5 min-h-[80px] cursor-pointer transition-colors hover:bg-muted/50",
                isToday && "ring-2 ring-primary ring-inset"
              )}
            >
              <div className={cn(
                "text-xs font-medium mb-1",
                isToday ? "text-primary font-bold" : "text-foreground"
              )}>
                {day}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map(ev => (
                  <div
                    key={ev.id}
                    className="text-[10px] px-1 py-0.5 rounded truncate font-medium"
                    style={{
                      backgroundColor: `${EVENT_TYPE_COLORS[ev.event_type]}20`,
                      color: EVENT_TYPE_COLORS[ev.event_type],
                      borderLeft: `2px solid ${EVENT_TYPE_COLORS[ev.event_type]}`,
                    }}
                    title={`${ev.title} - ${ev.rooms?.name ?? 'No room'}`}
                  >
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground pl-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              }) : ''}
            </DialogTitle>
            <DialogDescription>
              {selectedDateEvents.length === 0
                ? 'No events scheduled for this date.'
                : `${selectedDateEvents.length} event${selectedDateEvents.length > 1 ? 's' : ''} scheduled`
              }
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {selectedDateEvents.map(ev => (
                <Card key={ev.id} className={cn("border", EVENT_TYPE_BG[ev.event_type])}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5 flex-1">
                        <h4 className="font-semibold text-sm text-foreground">{ev.title}</h4>
                        {ev.description && (
                          <p className="text-xs text-muted-foreground">{ev.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs mt-2">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {ev.start_time.slice(0, 5)} – {ev.end_time.slice(0, 5)}
                          </span>
                          {ev.rooms?.name && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {ev.rooms.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {EVENT_TYPE_LABELS[ev.event_type]}
                      </Badge>
                    </div>
                    {!readOnly && (
                      <div className="flex gap-1 mt-3 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => { setDialogOpen(false); onEditClick?.(ev); }}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDeleteClick?.(ev.id)}>
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {!readOnly && selectedDate && (
                <Button
                  variant="outline"
                  className="w-full gap-2 mt-2"
                  onClick={() => {
                    setDialogOpen(false);
                    onBookClick?.(selectedDate);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  {selectedDateEvents.length > 0 ? 'Add Another Event' : 'Book This Date'}
                </Button>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
