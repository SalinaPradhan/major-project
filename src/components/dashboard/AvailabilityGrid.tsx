import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFacultyAvailability, useSetFacultyPreference } from '@/hooks/useFacultyAvailability';
import { useCallback, useMemo } from 'react';
import type { Database } from '@/integrations/supabase/types';

type DayOfWeek = Database['public']['Enums']['day_of_week'];

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const PREF_LABELS = ['Available', 'Preferred', 'Unavailable'] as const;
const PREF_STYLES = [
  'bg-secondary/30 text-muted-foreground',          // 0 = Available
  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20', // 1 = Preferred
  'bg-red-500/15 text-red-400 border border-red-500/20',            // 2 = Unavailable
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
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" />
          Availability Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-3 text-[10px] text-muted-foreground">
          {PREF_LABELS.map((label, i) => (
            <span key={label} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-muted-foreground/30' : i === 1 ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {label}
            </span>
          ))}
        </div>

        {!facultyId ? (
          <p className="text-sm text-muted-foreground">Faculty record not linked.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left text-muted-foreground p-1.5 w-20">Slot</th>
                    {DAYS.map((d) => (
                      <th key={d} className="text-center text-muted-foreground p-1.5 capitalize">{d.slice(0, 3)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot.id}>
                      <td className="text-muted-foreground p-1.5 font-mono whitespace-nowrap text-[10px]">{slot.label}</td>
                      {DAYS.map((day) => {
                        const key = `${day}-${slot.id}`;
                        const pref = prefMap[key] ?? 0;
                        return (
                          <td key={key} className="p-1">
                            <button
                              onClick={() => handleClick(day, slot.id)}
                              className={`w-full rounded-md px-1.5 py-1.5 text-center text-[10px] font-medium min-h-[28px] cursor-pointer transition-colors ${PREF_STYLES[pref]}`}
                            >
                              {PREF_LABELS[pref]}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {summaryPreferred} preferred, {summaryUnavailable} unavailable slots set
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
