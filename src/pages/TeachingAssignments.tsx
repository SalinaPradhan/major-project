import { useState } from 'react';
import { useTeachingAssignments, useCreateTeachingAssignment, useDeleteTeachingAssignment } from '@/hooks/useTeachingAssignments';
import { useFaculty } from '@/hooks/useFaculty';
import { useCourses } from '@/hooks/useCourses';
import { useBatches } from '@/hooks/useBatches';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TeachingAssignments() {
  const { isAdminOrAbove } = useAuth();
  const { data: assignments = [], isLoading } = useTeachingAssignments();
  const { data: faculty = [] } = useFaculty();
  const { data: courses = [] } = useCourses();
  const { data: batches = [] } = useBatches();
  const createAssignment = useCreateTeachingAssignment();
  const deleteAssignment = useDeleteTeachingAssignment();
  const { toast } = useToast();

  const [facultyId, setFacultyId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [isLab, setIsLab] = useState(false);

  const handleCreate = async () => {
    if (!facultyId || !courseId || !batchId) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Select faculty, course, and batch.' });
      return;
    }
    try {
      await createAssignment.mutateAsync({ faculty_id: facultyId, course_id: courseId, batch_id: batchId, is_lab: isLab });
      toast({ title: 'Assignment created' });
      setFacultyId('');
      setCourseId('');
      setBatchId('');
      setIsLab(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment.mutateAsync(id);
      toast({ title: 'Assignment deleted' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Teaching Assignments</h1>
      </div>

      {isAdminOrAbove && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Add Assignment</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label>Faculty</Label>
                <Select value={facultyId} onValueChange={setFacultyId}>
                  <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                  <SelectContent>{faculty.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Batch</Label>
                <Select value={batchId} onValueChange={setBatchId}>
                  <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                  <SelectContent>{batches.map(b => <SelectItem key={b.id} value={b.id}>{b.name} ({b.section})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={isLab} onCheckedChange={setIsLab} id="is-lab" />
                  <Label htmlFor="is-lab">Lab</Label>
                </div>
                <Button onClick={handleCreate} disabled={createAssignment.isPending}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card">
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : assignments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No teaching assignments yet. Add one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Type</TableHead>
                  {isAdminOrAbove && <TableHead className="w-16" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.faculty?.name ?? '—'}</TableCell>
                    <TableCell>{a.course?.code} — {a.course?.name}</TableCell>
                    <TableCell>{a.batch?.name} ({a.batch?.section})</TableCell>
                    <TableCell>
                      <Badge variant={a.is_lab ? 'secondary' : 'default'}>
                        {a.is_lab ? 'Lab' : 'Lecture'}
                      </Badge>
                    </TableCell>
                    {isAdminOrAbove && (
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
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
    </div>
  );
}
