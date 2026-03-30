import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Send } from 'lucide-react';
import { useVenueBookings, type VenueBooking } from '@/hooks/useVenueBookings';
import { VENUE_BG_COLORS, VENUE_LABELS, type PremierVenueType } from '@/types/venue';
import { useAuth } from '@/contexts/AuthContext';

interface VenueCalendarProps {
  onBookClick: (date: string) => void;
  onRequestClick: (booking: VenueBooking) => void;
  readOnly?: boolean;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function VenueCalendar({ onBookClick, onRequestClick, readOnly = false }: VenueCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { data: bookings = [] } = useVenueBookings();
  const { user } = useAuth();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const bookingsByDate = useMemo(() => {
    const map: Record<string, VenueBooking[]> = {};
    bookings.forEach((b) => {
      const key = b.event_date;
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [bookings]);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const selectedBookings = selectedDateStr ? (bookingsByDate[selectedDateStr] || []) : [];

  const getVenueTypeClass = (type?: string): string => {
    if (type && type in VENUE_BG_COLORS) {
      return VENUE_BG_COLORS[type as PremierVenueType];
    }
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
            {d}
          </div>
        ))}

        {/* Padding for start of month */}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {/* Calendar days */}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayBookings = bookingsByDate[dateStr] || [];
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(day)}
              className={cn(
                'aspect-square rounded-lg border border-transparent p-1 text-left transition-all hover:border-primary/30 hover:bg-primary/5 flex flex-col',
                isToday && 'border-primary/50 bg-primary/5',
                isSelected && 'border-primary bg-primary/10 ring-1 ring-primary/30',
                !isSameMonth(day, currentMonth) && 'opacity-40'
              )}
            >
              <span className={cn(
                'text-xs font-medium',
                isToday && 'text-primary font-bold'
              )}>
                {format(day, 'd')}
              </span>
              <div className="flex-1 overflow-hidden space-y-0.5 mt-0.5">
                {dayBookings.slice(0, 2).map((b) => (
                  <div
                    key={b.id}
                    className={cn(
                      'text-[9px] leading-tight truncate rounded px-1 py-0.5 border',
                      getVenueTypeClass(b.venue_type)
                    )}
                  >
                    {b.event_name}
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <div className="text-[9px] text-muted-foreground text-center">
                    +{dayBookings.length - 2} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
        {(Object.entries(VENUE_LABELS) as [PremierVenueType, string][]).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded-sm border', VENUE_BG_COLORS[type])} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Day detail modal */}
      <Dialog open={!!selectedDate} onOpenChange={(o) => !o && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {selectedBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-4">No events on this date</p>
                {!readOnly && (
                  <Button onClick={() => { setSelectedDate(null); onBookClick(selectedDateStr); }}>
                    <Plus className="h-4 w-4 mr-2" />Book Venue
                  </Button>
                )}
              </div>
            ) : (
              <>
                {selectedBookings.map((b) => (
                  <div key={b.id} className={cn('rounded-lg border p-3 space-y-1', getVenueTypeClass(b.venue_type))}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{b.event_name}</p>
                        <p className="text-xs opacity-80">
                          {b.venue_name} • {b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {b.venue_type && VENUE_LABELS[b.venue_type as PremierVenueType]}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-70">{b.description}</p>
                    <p className="text-xs font-medium">Hosted by: {b.host_name}</p>
                    {!readOnly && user?.id !== b.host_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-1"
                        onClick={() => { setSelectedDate(null); onRequestClick(b); }}
                      >
                        <Send className="h-3 w-3 mr-1" />Request to Join/Swap
                      </Button>
                    )}
                  </div>
                ))}
                {!readOnly && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => { setSelectedDate(null); onBookClick(selectedDateStr); }}
                    >
                      <Plus className="h-4 w-4 mr-2" />Book Another Venue
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
