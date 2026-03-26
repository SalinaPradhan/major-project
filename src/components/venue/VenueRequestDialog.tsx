import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateVenueRequest } from '@/hooks/useVenueRequests';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { VenueBooking } from '@/hooks/useVenueBookings';

const requestSchema = z.object({
  reason: z.string().min(1, 'Please provide a reason'),
});

interface VenueRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: VenueBooking | null;
}

export function VenueRequestDialog({ open, onOpenChange, booking }: VenueRequestDialogProps) {
  const createRequest = useCreateVenueRequest();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { reason: '' },
  });

  const onSubmit = async (values: z.infer<typeof requestSchema>) => {
    if (!user || !booking) return;
    const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';

    try {
      await createRequest.mutateAsync({
        booking_id: booking.id,
        requestor_id: user.id,
        requestor_name: displayName,
        reason: values.reason,
      });
      toast.success('Request sent to host for approval');
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send request');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request to Join/Swap</DialogTitle>
        </DialogHeader>
        {booking && (
          <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1 mb-2">
            <p><span className="font-medium">Event:</span> {booking.event_name}</p>
            <p><span className="font-medium">Venue:</span> {booking.venue_name}</p>
            <p><span className="font-medium">Host:</span> {booking.host_name}</p>
            <p><span className="font-medium">Date:</span> {booking.event_date} • {booking.start_time?.slice(0, 5)} – {booking.end_time?.slice(0, 5)}</p>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Request</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Explain why you need this slot..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createRequest.isPending}>
                {createRequest.isPending ? 'Sending...' : 'Send Request'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
