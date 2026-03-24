import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Building2 } from "lucide-react";
import { useDepartments, useCreateDepartment, useDeleteDepartment } from "@/hooks/useDepartments";
import { toast } from "sonner";

const Departments = () => {
  const { data: departments, isLoading } = useDepartments();
  const createMutation = useCreateDepartment();
  const deleteMutation = useDeleteDepartment();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });

  const handleSave = async () => {
    try {
      await createMutation.mutateAsync(form);
      toast.success("Department added");
      setOpen(false);
      setForm({ name: "", code: "" });
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try { await deleteMutation.mutateAsync(id); toast.success("Deleted"); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <PageHeader title="Departments" description="Manage university departments">
        <Button size="sm" onClick={() => { setForm({ name: "", code: "" }); setOpen(true); }}><Plus size={16} className="mr-1" /> Add Department</Button>
      </PageHeader>
      <div className="p-6">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : !departments?.length ? (
          <Card className="p-8 flex items-center justify-center text-muted-foreground">
            <div className="text-center"><Building2 size={48} className="mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">No departments added yet</p><p className="text-xs mt-1">Departments are needed for faculty, courses, and batches</p></div>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead className="w-16">Del</TableHead></TableRow></TableHeader>
              <TableBody>
                {departments.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs font-medium">{d.code}</TableCell>
                    <TableCell>{d.name}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(d.id, d.name)}><Trash2 size={14} /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Department</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Computer Science" /></div>
            <div><Label>Code *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.code}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Departments;
