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
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse } from "@/hooks/useCourses";
import { useDepartments } from "@/hooks/useDepartments";
import { toast } from "sonner";

const emptyForm = { name: "", code: "", department_id: "", credit_hours: 3, lecture_hours: 3, lab_hours: 0, requires_lab: false };

const Courses = () => {
  const { data: courses, isLoading } = useCourses();
  const { data: departments } = useDepartments();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (c: any) => {
    setEditId(c.id);
    setForm({ name: c.name, code: c.code, department_id: c.department_id || "", credit_hours: c.credit_hours, lecture_hours: c.lecture_hours, lab_hours: c.lab_hours, requires_lab: c.requires_lab });
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = { name: form.name, code: form.code, department_id: form.department_id || null, credit_hours: form.credit_hours, lecture_hours: form.lecture_hours, lab_hours: form.lab_hours, requires_lab: form.requires_lab };
    try {
      if (editId) { await updateMutation.mutateAsync({ id: editId, ...payload }); toast.success("Course updated"); }
      else { await createMutation.mutateAsync(payload); toast.success("Course added"); }
      setOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try { await deleteMutation.mutateAsync(id); toast.success("Course deleted"); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <PageHeader title="Courses" description="Manage courses and credit hours">
        <Button size="sm" onClick={openCreate}><Plus size={16} className="mr-1" /> Add Course</Button>
      </PageHeader>
      <div className="p-6">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : !courses?.length ? (
          <Card className="p-8 flex items-center justify-center text-muted-foreground">
            <div className="text-center"><BookOpen size={48} className="mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">No courses added yet</p></div>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Department</TableHead>
                  <TableHead>Credits</TableHead><TableHead>Lec/Lab Hrs</TableHead><TableHead>Lab?</TableHead><TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.code}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{(c as any).departments?.code || "—"}</TableCell>
                    <TableCell>{c.credit_hours}</TableCell>
                    <TableCell>{c.lecture_hours}/{c.lab_hours}</TableCell>
                    <TableCell>{c.requires_lab ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil size={14} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c.id, c.name)}><Trash2 size={14} /></Button>
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
          <DialogHeader><DialogTitle>{editId ? "Edit Course" : "Add Course"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Code *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS101" /></div>
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Intro to CS" /></div>
            </div>
            <div><Label>Department</Label>
              <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Credits</Label><Input type="number" value={form.credit_hours} onChange={(e) => setForm({ ...form, credit_hours: +e.target.value })} /></div>
              <div><Label>Lecture Hrs</Label><Input type="number" value={form.lecture_hours} onChange={(e) => setForm({ ...form, lecture_hours: +e.target.value })} /></div>
              <div><Label>Lab Hrs</Label><Input type="number" value={form.lab_hours} onChange={(e) => setForm({ ...form, lab_hours: +e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.requires_lab} onCheckedChange={(v) => setForm({ ...form, requires_lab: !!v })} />
              <Label>Requires Lab</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.code}>{editId ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Courses;
