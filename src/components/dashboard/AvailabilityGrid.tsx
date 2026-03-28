import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFacultyAvailability, useSetFacultyPreference } from '@/hooks/useFacultyAvailability';
import { useCallback, useMemo } from 'react';
import type { Database } from '@/integrations/supabase/types';

type DayOfWeek = Database['public']['Enums']['day_of_week'];

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const PREF_STYLES = [
  {}, // 0 = Available — default secondary
  { background: '#EAF3DE', borderColor: '#97C459' }, // 1 = Preferred
  { background: '#FCEBEB', borderColor: '#F09595' }, // 2 = Unavailable
];

interface AvailabilityGridProps {
  facultyId: string | null;
}

export function AvailabilityGrid({ facultyId }: AvailabilityGridProps) {
  const { data: timeSlots = [] } = useQuery({
    queryKey: ['time_slots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('is_break', false)
        .order('slot_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: preferences = [] } = useFacultyAvailability(facultyId);
  const setPref = useSetFacultyPreference();

  const prefMap = useMemo(() => {
    const m: Record<string, number> = {};
    preferences.forEach((p) => {
      m[`${p.day}-${p.time_slot_id}`] = p.preference;
    });
    return m;
  }, [preferences]);

  const handleClick = useCallback(
    (day: DayOfWeek, slotId: string) => {
      if (!facultyId) return;
      const key = `${day}-${slotId}`;
      const current = prefMap[key] ?? 0;
      const next = (current + 1) % 3;
      setPref.mutate({ faculty_id: facultyId, day, time_slot_id: slotId, preference: next });
    },
    [facultyId, prefMap, setPref]
  );

  const summaryPreferred = Object.values(prefMap).filter((v) => v === 1).length;
  const summaryUnavailable = Object.values(prefMap).filter((v) => v === 2).length;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" />
          Availability Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-secondary border border-border" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#EAF3DE', border: '1px solid #97C459' }} /> Preferred
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#FCEBEB', border: '1px solid #F09595' }} /> Unavailable
          </span>
        </div>

        {!facultyId ? (
          <p className="text-sm text-muted-foreground">Faculty record not linked.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div
                className="grid gap-[2px]"
                style={{ gridTemplateColumns: `56px repeat(6, 1fr)` }}
              >
                {/* Header */}
                <div />
                {DAYS.map((d) => (
                  <div key={d} className="text-[10px] text-center text-muted-foreground capitalize p-1 font-medium">
                    {d.slice(0, 3)}
                  </div>
                ))}

                {/* Rows */}
                {timeSlots.map((slot) => (
                  <>
                    <div key={`l-${slot.id}`} className="text-[10px] text-muted-foreground font-mono flex items-center">
                      {slot.label}
                    </div>
                    {DAYS.map((day) => {
                      const key = `${day}-${slot.id}`;
                      const pref = prefMap[key] ?? 0;
                      return (
                        <button
                          key={key}
                          onClick={() => handleClick(day, slot.id)}
                          className="rounded min-h-[22px] border cursor-pointer transition-colors"
                          style={
                            pref === 0
                              ? { background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }
                              : PREF_STYLES[pref]
                          }
                        />
                      );
                    })}
                  </>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-3">
              {summaryPreferred} preferred, {summaryUnavailable} unavailable slots set
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
