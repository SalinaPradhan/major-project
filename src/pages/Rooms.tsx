import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRooms, useDeleteRoom } from '@/hooks/useRooms';
import { useAuth } from '@/contexts/AuthContext';
import { isPremierVenueType } from '@/hooks/usePremierVenues';
import { RoomFormDialog } from '@/components/forms/RoomFormDialog';
import { DeleteConfirmDialog } from '@/components/forms/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search, DoorOpen, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

export default function Rooms() {
  const { isAdminOrAbove } = useAuth();
  const { data: rooms = [], isLoading } = useRooms();
  const deleteRoom = useDeleteRoom();
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Tables<'rooms'> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.building || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (room: Tables<'rooms'>) => {
    setEditingRoom(room);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRoom.mutateAsync(deleteId);
      toast.success('Room deleted');
    } catch (e: any) {
      toast.error(e.message);
    }
    setDeleteId(null);
  };

  const typeColors: Record<string, string> = {
    classroom: 'bg-primary/20 text-primary',
    lab: 'bg-amber-500/20 text-amber-400',
    auditorium: 'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DoorOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Rooms</h1>
          <Badge variant="secondary">{rooms.length}</Badge>
        </div>
        {isAdminOrAbove && (
          <Button onClick={() => { setEditingRoom(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />Add Room
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search rooms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading rooms...</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Projector</TableHead>
                {isAdminOrAbove && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeColors[r.room_type] || ''}>
                      {r.room_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.capacity}</TableCell>
                  <TableCell>{r.building ?? '—'}</TableCell>
                  <TableCell>{r.floor ?? '—'}</TableCell>
                  <TableCell>{r.has_projector ? '✓' : '—'}</TableCell>
                  {isAdminOrAbove && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No rooms found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <RoomFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        room={editingRoom}
      />
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Room"
        description="This will permanently delete this room. Any schedules using it will be affected."
        isPending={deleteRoom.isPending}
      />
    </div>
  );
}
