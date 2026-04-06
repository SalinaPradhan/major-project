import { useState } from 'react';
import { useFaculty, useDeleteFaculty } from '@/hooks/useFaculty';
import { useAuth } from '@/contexts/AuthContext';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { FacultyFormDialog } from '@/components/forms/FacultyFormDialog';
import { FacultyAvailabilityDialog } from '@/components/forms/FacultyAvailabilityDialog';
import { DeleteConfirmDialog } from '@/components/forms/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

export default function Faculty() {
  const { isAdminOrAbove } = useAuth();
  const { data: faculty = [], isLoading } = useFaculty();
  const deleteFaculty = useDeleteFaculty();
  const [formOpen, setFormOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Tables<'faculty'> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [availabilityFaculty, setAvailabilityFaculty] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState('');

  const filtered = faculty.filter((f: any) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, totalPages, totalItems, hasNextPage, hasPrevPage, nextPage, prevPage, goToPage } = usePaginatedQuery({ data: filtered });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFaculty.mutateAsync(deleteId);
      toast.success('Faculty deleted');
    } catch (e: any) {
      toast.error(e.message);
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Faculty</h1>
          <Badge variant="secondary">{faculty.length}</Badge>
        </div>
        {isAdminOrAbove && (
          <Button onClick={() => { setEditingFaculty(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />Add Faculty
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search faculty..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading faculty...</p>
      ) : (
        <>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Max Hrs/Day</TableHead>
                  <TableHead>Max Hrs/Week</TableHead>
                  {isAdminOrAbove && <TableHead className="w-32">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((f: any) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>{f.email ?? '—'}</TableCell>
                    <TableCell>{f.departments?.name ?? '—'}</TableCell>
                    <TableCell>{f.max_hours_per_day}</TableCell>
                    <TableCell>{f.max_hours_per_week}</TableCell>
                    {isAdminOrAbove && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setAvailabilityFaculty({ id: f.id, name: f.name })}>
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setEditingFaculty(f); setFormOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(f.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No faculty found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} hasNextPage={hasNextPage} hasPrevPage={hasPrevPage} nextPage={nextPage} prevPage={prevPage} goToPage={goToPage} />
        </>
      )}

      <FacultyFormDialog open={formOpen} onOpenChange={setFormOpen} faculty={editingFaculty} />
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Faculty"
        description="This will permanently delete this faculty member."
        isPending={deleteFaculty.isPending}
      />
      {availabilityFaculty && (
        <FacultyAvailabilityDialog
          open={!!availabilityFaculty}
          onOpenChange={(o) => !o && setAvailabilityFaculty(null)}
          facultyId={availabilityFaculty.id}
          facultyName={availabilityFaculty.name}
        />
      )}
    </div>
  );
}
