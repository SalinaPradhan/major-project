import { useState } from 'react';
import { useCourses, useDeleteCourse, useCreateCourse, useUpdateCourse } from '@/hooks/useCourses';
import { useDepartments } from '@/hooks/useDepartments';
import { useAuth } from '@/contexts/AuthContext';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { DeleteConfirmDialog } from '@/components/forms/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

export default function Courses() {
  const { isAdminOrAbove } = useAuth();
  const { data: courses = [], isLoading } = useCourses();
  const { data: departments = [] } = useDepartments();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Tables<'courses'> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [creditHours, setCreditHours] = useState('3');
  const [lectureHours, setLectureHours] = useState('3');
  const [labHours, setLabHours] = useState('0');
  const [requiresLab, setRequiresLab] = useState(false);
  const [departmentId, setDepartmentId] = useState('');

  const filtered = courses.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, totalPages, totalItems, hasNextPage, hasPrevPage, nextPage, prevPage, goToPage } = usePaginatedQuery({ data: filtered });

  const openAdd = () => {
    setEditing(null);
    setCode(''); setName(''); setCreditHours('3'); setLectureHours('3'); setLabHours('0'); setRequiresLab(false); setDepartmentId('');
    setFormOpen(true);
  };

  const openEdit = (c: Tables<'courses'>) => {
    setEditing(c);
    setCode(c.code); setName(c.name); setCreditHours(String(c.credit_hours)); setLectureHours(String(c.lecture_hours)); setLabHours(String(c.lab_hours)); setRequiresLab(c.requires_lab); setDepartmentId(c.department_id ?? '');
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code, name,
      credit_hours: parseInt(creditHours),
      lecture_hours: parseInt(lectureHours),
      lab_hours: parseInt(labHours),
      requires_lab: requiresLab,
      department_id: departmentId || null,
    };
    try {
      if (editing) {
        await updateCourse.mutateAsync({ id: editing.id, ...payload });
        toast.success('Course updated');
      } else {
        await createCourse.mutateAsync(payload);
        toast.success('Course created');
      }
      setFormOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteCourse.mutateAsync(deleteId); toast.success('Course deleted'); } catch (e: any) { toast.error(e.message); }
    setDeleteId(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <Badge variant="secondary">{courses.length}</Badge>
        </div>
        {isAdminOrAbove && (
          <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add Course</Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading courses...</p>
      ) : (
        <>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Lecture</TableHead>
                  <TableHead>Lab</TableHead>
                  {isAdminOrAbove && <TableHead className="w-24">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.code}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.departments?.name ?? '—'}</TableCell>
                    <TableCell>{c.credit_hours}</TableCell>
                    <TableCell>{c.lecture_hours}</TableCell>
                    <TableCell>{c.lab_hours}{c.requires_lab && <Badge variant="outline" className="ml-2 text-xs">Lab</Badge>}</TableCell>
                    {isAdminOrAbove && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {paginatedData.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No courses found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} hasNextPage={hasNextPage} hasPrevPage={hasPrevPage} nextPage={nextPage} prevPage={prevPage} goToPage={goToPage} />
        </>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Course' : 'Add New Course'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Credits</Label><Input type="number" value={creditHours} onChange={(e) => setCreditHours(e.target.value)} /></div>
              <div className="space-y-2"><Label>Lecture Hrs</Label><Input type="number" value={lectureHours} onChange={(e) => setLectureHours(e.target.value)} /></div>
              <div className="space-y-2"><Label>Lab Hrs</Label><Input type="number" value={labHours} onChange={(e) => setLabHours(e.target.value)} /></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label>Requires Lab</Label>
              <Switch checked={requiresLab} onCheckedChange={setRequiresLab} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createCourse.isPending || updateCourse.isPending}>{editing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} title="Delete Course" isPending={deleteCourse.isPending} />
    </div>
  );
}
