import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateSwapRequest } from '@/hooks/useSwapRequests';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facultyId: string;
  requesterName: string;
}

export function SwapRequestFormDialog({ open, onOpenChange, facultyId, requesterName }: Props) {
  const [fromDay, setFromDay] = useState('');
  const [fromSlotId, setFromSlotId] = useState('');
  const [toDay, setToDay] = useState('');
  const [toSlotId, setToSlotId] = useState('');
  const [reason, setReason] = useState('');

  const createSwap = useCreateSwapRequest();

  const { data: timeSlots = [] } = useQuery({
    queryKey: ['time_slots_non_break'],
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

  const handleSubmit = () => {
    if (!fromDay || !fromSlotId || !toDay || !toSlotId) {
      toast.error('Please select all day and slot fields');
      return;
    }
    createSwap.mutate(
      { facultyId, requesterName, fromDay, fromSlotId, toDay, toSlotId, reason },
      {
        onSuccess: () => {
          toast.success('Swap request submitted');
          onOpenChange(false);
          setFromDay(''); setFromSlotId(''); setToDay(''); setToSlotId(''); setReason('');
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Swap Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">From Day</Label>
              <Select value={fromDay} onValueChange={setFromDay}>
                <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">From Slot</Label>
              <Select value={fromSlotId} onValueChange={setFromSlotId}>
                <SelectTrigger><SelectValue placeholder="Period" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">To Day</Label>
              <Select value={toDay} onValueChange={setToDay}>
                <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To Slot</Label>
              <Select value={toSlotId} onValueChange={setToSlotId}>
                <SelectTrigger><SelectValue placeholder="Period" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Reason</Label>
            <Textarea
              placeholder="Why do you need this swap?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[60px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createSwap.isPending}>
            {createSwap.isPending ? 'Submitting…' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
