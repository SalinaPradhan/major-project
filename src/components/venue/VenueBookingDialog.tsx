import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { usePremierVenues } from '@/hooks/usePremierVenues';
import { useCreateVenueBooking } from '@/hooks/useVenueBookings';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { VENUE_LABELS, type PremierVenueType } from '@/types/venue';

const bookingSchema = z.object({
  venue_id: z.string().min(1, 'Select a venue'),
  event_name: z.string().min(1, 'Event name is required'),
  description: z.string().min(1, 'Description is required'),
  event_date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface VenueBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultVenueId?: string;
}

export function VenueBookingDialog({ open, onOpenChange, defaultDate, defaultVenueId }: VenueBookingDialogProps) {
  const { data: venues = [] } = usePremierVenues();
  const createBooking = useCreateVenueBooking();
  const { user } = useAuth();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      venue_id: defaultVenueId || '',
      event_name: '',
      description: '',
      event_date: defaultDate || '',
      start_time: '09:00',
      end_time: '10:00',
    },
  });

  // Reset form when dialog opens with new defaults
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      form.reset({
        venue_id: defaultVenueId || '',
        event_name: '',
        description: '',
        event_date: defaultDate || '',
        start_time: '09:00',
        end_time: '10:00',
      });
    }
    onOpenChange(isOpen);
  };

  const onSubmit = async (values: BookingFormValues) => {
    if (!user) return;
    const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';

    try {
      await createBooking.mutateAsync({
        ...values,
        host_id: user.id,
        host_name: displayName,
      });
      toast.success('Venue booked successfully! A system-wide alert has been sent.');
      handleOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to book venue');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Book Premier Venue</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="venue_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a venue" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {venues.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} ({VENUE_LABELS[v.room_type as PremierVenueType] || v.room_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Annual Hackathon" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe the event..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createBooking.isPending}>
                {createBooking.isPending ? 'Booking...' : 'Book Venue'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
