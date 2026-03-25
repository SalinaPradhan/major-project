import { useState } from 'react';
import { useBatches, useDeleteBatch, useCreateBatch, useUpdateBatch } from '@/hooks/useBatches';
import { useDepartments } from '@/hooks/useDepartments';
import { useAuth } from '@/contexts/AuthContext';
import { DeleteConfirmDialog } from '@/components/forms/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

export default function Batches() {
  const { isAdminOrAbove } = useAuth();
  const { data: batches = [], isLoading } = useBatches();
  const { data: departments = [] } = useDepartments();
  const createBatch = useCreateBatch();
  const updateBatch = useUpdateBatch();
  const deleteBatch = useDeleteBatch();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Tables<'batches'> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [name, setName] = useState('');
  const [semester, setSemester] = useState('1');
  const [section, setSection] = useState('A');
  const [strength, setStrength] = useState('30');
  const [departmentId, setDepartmentId] = useState('');

  const filtered = batches.filter((b: any) => b.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditing(null); setName(''); setSemester('1'); setSection('A'); setStrength('30'); setDepartmentId('');
    setFormOpen(true);
  };
  const openEdit = (b: Tables<'batches'>) => {
    setEditing(b); setName(b.name); setSemester(String(b.semester)); setSection(b.section); setStrength(String(b.strength)); setDepartmentId(b.department_id ?? '');
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, semester: parseInt(semester), section, strength: parseInt(strength), department_id: departmentId || null };
    try {
      if (editing) { await updateBatch.mutateAsync({ id: editing.id, ...payload }); toast.success('Batch updated'); }
      else { await createBatch.mutateAsync(payload); toast.success('Batch created'); }
      setFormOpen(false);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteBatch.mutateAsync(deleteId); toast.success('Batch deleted'); } catch (e: any) { toast.error(e.message); }
    setDeleteId(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Batches</h1>
          <Badge variant="secondary">{batches.length}</Badge>
        </div>
        {isAdminOrAbove && (
          <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add Batch</Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search batches..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading batches...</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Strength</TableHead>
                {isAdminOrAbove && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b: any) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell>{b.departments?.name ?? '—'}</TableCell>
                  <TableCell>{b.semester}</TableCell>
                  <TableCell>{b.section}</TableCell>
                  <TableCell>{b.strength}</TableCell>
                  {isAdminOrAbove && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No batches found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Batch' : 'Add New Batch'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Semester</Label><Input type="number" min="1" max="8" value={semester} onChange={(e) => setSemester(e.target.value)} /></div>
              <div className="space-y-2"><Label>Section</Label><Input value={section} onChange={(e) => setSection(e.target.value)} /></div>
              <div className="space-y-2"><Label>Strength</Label><Input type="number" value={strength} onChange={(e) => setStrength(e.target.value)} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createBatch.isPending || updateBatch.isPending}>{editing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} title="Delete Batch" isPending={deleteBatch.isPending} />
    </div>
  );
}
