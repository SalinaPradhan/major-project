import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Plus, Pencil, Trash2, List } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { EventFormDialog } from '@/components/forms/EventFormDialog';
import { EventCalendar } from '@/components/events/EventCalendar';
import { DeleteConfirmDialog } from '@/components/forms/DeleteConfirmDialog';
import { format } from 'date-fns';
import type { Event, EventInsert } from '@/hooks/useEvents';

const TYPE_COLORS: Record<string, string> = {
  exam: 'bg-destructive/10 text-destructive',
  seminar: 'bg-primary/10 text-primary',
  workshop: 'bg-accent text-accent-foreground',
  meeting: 'bg-secondary text-secondary-foreground',
  other: 'bg-muted text-muted-foreground',
};

export default function EventScheduler() {
  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useEvents();
  const { isAdminOrAbove, isFaculty, user } = useAuth();
  const canManage = isAdminOrAbove || isFaculty;

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [prefilledDate, setPrefilledDate] = useState('');

  const filtered = typeFilter === 'all' ? events : events.filter(e => e.event_type === typeFilter);

  const handleSubmit = (data: EventInsert) => {
    if (editingEvent) {
      updateEvent.mutate({ id: editingEvent.id, ...data }, { onSuccess: () => { setFormOpen(false); setEditingEvent(null); } });
    } else {
      createEvent.mutate({ ...data, created_by: user?.id }, { onSuccess: () => setFormOpen(false) });
    }
  };

  const openNewEvent = (date?: string) => {
    setEditingEvent(null);
    setPrefilledDate(date || '');
    setFormOpen(true);
  };

  const openEditEvent = (event: Event) => {
    setEditingEvent(event);
    setPrefilledDate('');
    setFormOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Event Scheduler</h1>
        </div>
        {canManage && (
          <Button onClick={() => openNewEvent()}>
            <Plus className="h-4 w-4 mr-2" />Add Event
          </Button>
        )}
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar" className="gap-1.5">
            <CalendarIcon className="h-4 w-4" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5">
            <List className="h-4 w-4" /> List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card className="glass-card">
            <CardContent className="pt-6">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading events...</p>
              ) : (
                <EventCalendar
                  events={events}
                  readOnly={!canManage}
                  onBookClick={(date) => openNewEvent(date)}
                  onEditClick={(ev) => openEditEvent(ev)}
                  onDeleteClick={(id) => setDeleteId(id)}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Filter by Type</CardTitle>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading events...</p>
              ) : filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No events found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Status</TableHead>
                      {canManage && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(event => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={TYPE_COLORS[event.event_type]}>
                            {event.event_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(event.event_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{event.start_time.slice(0, 5)} – {event.end_time.slice(0, 5)}</TableCell>
                        <TableCell>{event.rooms?.name ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>{event.status}</Badge>
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-right space-x-1">
                            <Button size="icon" variant="ghost" onClick={() => openEditEvent(event)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setDeleteId(event.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        event={editingEvent}
        isLoading={createEvent.isPending || updateEvent.isPending}
        defaultDate={prefilledDate}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteEvent.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
      />
    </div>
  );
}
