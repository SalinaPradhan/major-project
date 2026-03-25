import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useFacultyAvailability, useSetFacultyPreference } from '@/hooks/useFacultyAvailability';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type DayOfWeek = Database['public']['Enums']['day_of_week'];

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const preferenceLabels: Record<number, { label: string; color: string }> = {
  0: { label: 'Unavailable', color: 'bg-destructive/20 text-destructive' },
  1: { label: 'Available', color: 'bg-muted text-muted-foreground' },
  2: { label: 'Preferred', color: 'bg-primary/20 text-primary' },
};

interface FacultyAvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facultyId: string;
  facultyName: string;
}

export function FacultyAvailabilityDialog({
  open,
  onOpenChange,
  facultyId,
  facultyName,
}: FacultyAvailabilityDialogProps) {
  const { data: preferences } = useFacultyAvailability(facultyId);
  const setPreference = useSetFacultyPreference();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');

  const { data: timeSlots } = useQuery({
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

  const getPreference = (day: DayOfWeek, timeSlotId: string): number => {
    const pref = preferences?.find(
      (p) => p.day === day && p.time_slot_id === timeSlotId
    );
    return pref?.preference ?? 1;
  };

  const handleToggle = async (day: DayOfWeek, timeSlotId: string) => {
    const current = getPreference(day, timeSlotId);
    const next = current === 2 ? 0 : current + 1;
    try {
      await setPreference.mutateAsync({
        faculty_id: facultyId,
        day,
        time_slot_id: timeSlotId,
        preference: next,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update preference');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Availability — {facultyName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Day</Label>
            <Select value={selectedDay} onValueChange={(v) => setSelectedDay(v as DayOfWeek)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day} value={day} className="capitalize">
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Click to toggle:</span>
              {Object.entries(preferenceLabels).map(([key, { label, color }]) => (
                <Badge key={key} variant="outline" className={color}>
                  {label}
                </Badge>
              ))}
            </div>

            <div className="grid gap-2">
              {timeSlots?.map((slot) => {
                const pref = getPreference(selectedDay, slot.id);
                const { label, color } = preferenceLabels[pref] || preferenceLabels[1];
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => handleToggle(selectedDay, slot.id)}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50 ${color}`}
                    disabled={setPreference.isPending}
                  >
                    <span className="text-sm font-medium">{slot.label}</span>
                    <span className="text-xs">
                      {slot.start_time} — {slot.end_time}
                    </span>
                    <Badge variant="outline" className={color}>
                      {label}
                    </Badge>
                  </button>
                );
              })}
              {(!timeSlots || timeSlots.length === 0) && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No time slots configured. Add time slots first.
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
