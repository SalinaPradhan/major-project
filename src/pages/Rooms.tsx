import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Room = Tables<"rooms">;
const roomTypes: Enums<"room_type">[] = ["classroom", "lab", "auditorium"];

export default function Rooms() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [name, setName] = useState("");
  const [roomType, setRoomType] = useState<Enums<"room_type">>("classroom");
  const [capacity, setCapacity] = useState("30");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [hasProjector, setHasProjector] = useState(true);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        room_type: roomType,
        capacity: parseInt(capacity),
        building: building || null,
        floor: floor ? parseInt(floor) : null,
        has_projector: hasProjector,
      };
      if (editing) {
        const { error } = await supabase.from("rooms").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rooms").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast({ title: editing ? "Room updated" : "Room created" });
      closeDialog();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast({ title: "Room deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openEdit = (r: Room) => {
    setEditing(r);
    setName(r.name);
    setRoomType(r.room_type);
    setCapacity(String(r.capacity));
    setBuilding(r.building ?? "");
    setFloor(r.floor != null ? String(r.floor) : "");
    setHasProjector(r.has_projector);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
    setName("");
    setRoomType("classroom");
    setCapacity("30");
    setBuilding("");
    setFloor("");
    setHasProjector(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Rooms</h1>
        <Dialog open={open} onOpenChange={(o) => { if (!o) closeDialog(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Add"} Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); upsert.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={roomType} onValueChange={(v) => setRoomType(v as Enums<"room_type">)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Building</Label>
                  <Input value={building} onChange={(e) => setBuilding(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={hasProjector} onCheckedChange={(v) => setHasProjector(!!v)} />
                <Label>Has Projector</Label>
              </div>
              <Button type="submit" className="w-full" disabled={upsert.isPending}>
                {editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Projector</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell className="capitalize">{r.room_type}</TableCell>
                <TableCell>{r.capacity}</TableCell>
                <TableCell>{r.building ?? "—"}</TableCell>
                <TableCell>{r.floor ?? "—"}</TableCell>
                <TableCell>{r.has_projector ? "✓" : "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
