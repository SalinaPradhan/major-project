import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays, List, Inbox, Plus } from 'lucide-react';
import { VenueCalendar } from '@/components/venue/VenueCalendar';
import { VenueBookingDialog } from '@/components/venue/VenueBookingDialog';
import { VenueRequestDialog } from '@/components/venue/VenueRequestDialog';
import { VenueRequestsPanel } from '@/components/venue/VenueRequestsPanel';
import { useVenueBookings, type VenueBooking } from '@/hooks/useVenueBookings';
import { useCancelVenueBooking } from '@/hooks/useVenueBookings';
import { useAuth } from '@/contexts/AuthContext';
import { VENUE_BG_COLORS, type PremierVenueType } from '@/types/venue';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

export default function VenueManagement() {
  const { user, isStudent } = useAuth();
  const { data: allBookings = [], isLoading } = useVenueBookings();
  const cancelBooking = useCancelVenueBooking();
  const [searchParams] = useSearchParams();

  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<VenueBooking | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingVenueId] = useState(searchParams.get('venue') || '');

  const myBookings = allBookings.filter(b => b.host_id === user?.id);

  const handleBookClick = (date: string) => {
    setBookingDate(date);
    setBookingDialogOpen(true);
  };

  const handleRequestClick = (booking: VenueBooking) => {
    setSelectedBooking(booking);
    setRequestDialogOpen(true);
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelBooking.mutateAsync(id);
      toast.success('Booking cancelled');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Venue Management</h1>
          <Badge variant="secondary">{allBookings.length} bookings</Badge>
        </div>
        <Button onClick={() => { setBookingDate(''); setBookingDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Book Venue
        </Button>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar" className="gap-1.5">
            <CalendarDays className="h-4 w-4" />Calendar
          </TabsTrigger>
          <TabsTrigger value="my-bookings" className="gap-1.5">
            <List className="h-4 w-4" />My Bookings
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5">
            <Inbox className="h-4 w-4" />Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card className="glass-card">
            <CardContent className="pt-6">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : (
                <VenueCalendar onBookClick={handleBookClick} onRequestClick={handleRequestClick} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-bookings">
          <Card className="glass-card">
            <CardContent className="pt-6">
              {myBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">You haven't booked any venues yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myBookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.event_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(VENUE_BG_COLORS[b.venue_type as PremierVenueType] || '')}>
                            {b.venue_name}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(b.event_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}</TableCell>
                        <TableCell>
                          <Badge variant={b.status === 'confirmed' ? 'default' : 'secondary'}>{b.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {b.status === 'confirmed' && (
                            <Button size="sm" variant="destructive" onClick={() => handleCancel(b.id)}>
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <VenueRequestsPanel />
        </TabsContent>
      </Tabs>

      <VenueBookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        defaultDate={bookingDate}
        defaultVenueId={bookingVenueId}
      />

      <VenueRequestDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        booking={selectedBooking}
      />
    </div>
  );
}
