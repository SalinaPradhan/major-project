import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { useFaculty, useCreateFaculty, useUpdateFaculty, useDeleteFaculty } from "@/hooks/useFaculty";
import { useDepartments } from "@/hooks/useDepartments";
import { toast } from "sonner";

const emptyForm = { name: "", email: "", department_id: "", max_hours_per_day: 6, max_hours_per_week: 18 };

const Faculty = () => {
  const { data: faculty, isLoading } = useFaculty();
  const { data: departments } = useDepartments();
  const createMutation = useCreateFaculty();
  const updateMutation = useUpdateFaculty();
  const deleteMutation = useDeleteFaculty();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (f: any) => {
    setEditId(f.id);
    setForm({ name: f.name, email: f.email || "", department_id: f.department_id || "", max_hours_per_day: f.max_hours_per_day, max_hours_per_week: f.max_hours_per_week });
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      email: form.email || null,
      department_id: form.department_id || null,
      max_hours_per_day: form.max_hours_per_day,
      max_hours_per_week: form.max_hours_per_week,
    };
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, ...payload });
        toast.success("Faculty updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Faculty added");
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Faculty deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <PageHeader title="Faculty" description="Manage faculty members and their preferences">
        <Button size="sm" onClick={openCreate}><Plus size={16} className="mr-1" /> Add Faculty</Button>
      </PageHeader>

      <div className="p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !faculty?.length ? (
          <Card className="p-8 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Users size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No faculty added yet</p>
              <p className="text-xs mt-1">Click "Add Faculty" to get started</p>
            </div>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Max Hrs/Day</TableHead>
                  <TableHead>Max Hrs/Week</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculty.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell className="text-muted-foreground">{f.email || "—"}</TableCell>
                    <TableCell>{(f as any).departments?.code || "—"}</TableCell>
                    <TableCell>{f.max_hours_per_day}</TableCell>
                    <TableCell>{f.max_hours_per_week}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(f)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(f.id, f.name)}>
                          <Trash2 size={14} />
                        </Button>
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
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Faculty" : "Add Faculty"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. John Smith" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@university.edu" />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Hours/Day</Label>
                <Input type="number" value={form.max_hours_per_day} onChange={(e) => setForm({ ...form, max_hours_per_day: +e.target.value })} />
              </div>
              <div>
                <Label>Max Hours/Week</Label>
                <Input type="number" value={form.max_hours_per_week} onChange={(e) => setForm({ ...form, max_hours_per_week: +e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || createMutation.isPending || updateMutation.isPending}>
              {editId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Faculty;
