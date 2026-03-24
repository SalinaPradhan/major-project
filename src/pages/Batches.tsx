import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { useBatches, useCreateBatch, useUpdateBatch, useDeleteBatch } from "@/hooks/useBatches";
import { useDepartments } from "@/hooks/useDepartments";
import { toast } from "sonner";

const emptyForm = { name: "", department_id: "", semester: 1, section: "A", strength: 30 };

const Batches = () => {
  const { data: batches, isLoading } = useBatches();
  const { data: departments } = useDepartments();
  const createMutation = useCreateBatch();
  const updateMutation = useUpdateBatch();
  const deleteMutation = useDeleteBatch();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (b: any) => {
    setEditId(b.id);
    setForm({ name: b.name, department_id: b.department_id || "", semester: b.semester, section: b.section, strength: b.strength });
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = { name: form.name, department_id: form.department_id || null, semester: form.semester, section: form.section, strength: form.strength };
    try {
      if (editId) { await updateMutation.mutateAsync({ id: editId, ...payload }); toast.success("Batch updated"); }
      else { await createMutation.mutateAsync(payload); toast.success("Batch added"); }
      setOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try { await deleteMutation.mutateAsync(id); toast.success("Batch deleted"); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <PageHeader title="Batches" description="Manage student batches and sections">
        <Button size="sm" onClick={openCreate}><Plus size={16} className="mr-1" /> Add Batch</Button>
      </PageHeader>
      <div className="p-6">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : !batches?.length ? (
          <Card className="p-8 flex items-center justify-center text-muted-foreground">
            <div className="text-center"><GraduationCap size={48} className="mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">No batches added yet</p></div>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Section</TableHead><TableHead>Semester</TableHead>
                  <TableHead>Department</TableHead><TableHead>Strength</TableHead><TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.section}</TableCell>
                    <TableCell>{b.semester}</TableCell>
                    <TableCell>{(b as any).departments?.code || "—"}</TableCell>
                    <TableCell>{b.strength}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil size={14} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(b.id, b.name)}><Trash2 size={14} /></Button>
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
          <DialogHeader><DialogTitle>{editId ? "Edit Batch" : "Add Batch"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="BCS-2024" /></div>
            <div><Label>Department</Label>
              <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Semester</Label><Input type="number" value={form.semester} onChange={(e) => setForm({ ...form, semester: +e.target.value })} /></div>
              <div><Label>Section</Label><Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="A" /></div>
              <div><Label>Strength</Label><Input type="number" value={form.strength} onChange={(e) => setForm({ ...form, strength: +e.target.value })} /></div>
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

export default Batches;
