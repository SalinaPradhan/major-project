import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, DoorOpen } from "lucide-react";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { toast } from "sonner";

type RoomType = "classroom" | "lab" | "auditorium";
const emptyForm = { name: "", capacity: 30, room_type: "classroom" as RoomType, has_projector: true, building: "", floor: 0 };

const Rooms = () => {
  const { data: rooms, isLoading } = useRooms();
  const createMutation = useCreateRoom();
  const updateMutation = useUpdateRoom();
  const deleteMutation = useDeleteRoom();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (r: any) => {
    setEditId(r.id);
    setForm({ name: r.name, capacity: r.capacity, room_type: r.room_type, has_projector: r.has_projector, building: r.building || "", floor: r.floor || 0 });
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = { name: form.name, capacity: form.capacity, room_type: form.room_type, has_projector: form.has_projector, building: form.building || null, floor: form.floor || null };
    try {
      if (editId) { await updateMutation.mutateAsync({ id: editId, ...payload }); toast.success("Room updated"); }
      else { await createMutation.mutateAsync(payload); toast.success("Room added"); }
      setOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try { await deleteMutation.mutateAsync(id); toast.success("Room deleted"); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <PageHeader title="Rooms" description="Manage classrooms, labs, and their capacities">
        <Button size="sm" onClick={openCreate}><Plus size={16} className="mr-1" /> Add Room</Button>
      </PageHeader>
      <div className="p-6">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : !rooms?.length ? (
          <Card className="p-8 flex items-center justify-center text-muted-foreground">
            <div className="text-center"><DoorOpen size={48} className="mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">No rooms added yet</p></div>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Capacity</TableHead>
                  <TableHead>Building</TableHead><TableHead>Floor</TableHead><TableHead>Projector</TableHead><TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="capitalize">{r.room_type}</TableCell>
                    <TableCell>{r.capacity}</TableCell>
                    <TableCell>{r.building || "—"}</TableCell>
                    <TableCell>{r.floor ?? "—"}</TableCell>
                    <TableCell>{r.has_projector ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil size={14} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(r.id, r.name)}><Trash2 size={14} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Edit Room" : "Add Room"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Room 101" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Type</Label>
                <Select value={form.room_type} onValueChange={(v) => setForm({ ...form, room_type: v as RoomType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classroom">Classroom</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                    <SelectItem value="auditorium">Auditorium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Building</Label><Input value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} placeholder="Block A" /></div>
              <div><Label>Floor</Label><Input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: +e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.has_projector} onCheckedChange={(v) => setForm({ ...form, has_projector: !!v })} />
              <Label>Has Projector</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name}>{editId ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rooms;
