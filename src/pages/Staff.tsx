import { useState } from 'react';
import { Plus, Users2, Pencil, Trash2 } from 'lucide-react';
import { ResourceFilters, FilterOption } from '@/components/resources/ResourceFilters';
import { StatusBadge } from '@/components/resources/StatusBadge';
import { ResourceTable } from '@/components/resources/ResourceTable';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from '@/hooks/useStaff';
import { useResourceFilters } from '@/hooks/useResourceFilters';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { StaffFormDialog, StaffFormValues } from '@/components/forms/StaffFormDialog';
import { DeleteConfirmDialog } from '@/components/forms/DeleteConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { SupportStaff } from '@/types';

export default function Staff() {
  const { data: staff, isLoading, error } = useStaff();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<SupportStaff | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<SupportStaff | null>(null);

  const { search, setSearch, statusFilter, setStatusFilter, typeFilter, setTypeFilter, filteredData } =
    useResourceFilters({
      data: staff,
      searchFields: ['name', 'email', 'department'] as (keyof SupportStaff)[],
      statusField: 'status',
      typeField: 'role',
    });

  const { paginatedData: paginatedStaff, currentPage, totalPages, totalItems, hasNextPage, hasPrevPage, nextPage, prevPage, goToPage } = usePaginatedQuery({ data: filteredData });

  const statusOptions: FilterOption[] = [
    { value: 'available', label: 'Available' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'on_leave', label: 'On Leave' },
  ];

  const roleOptions: FilterOption[] = [
    { value: 'lab_assistant', label: 'Lab Assistant' },
    { value: 'technician', label: 'Technician' },
    { value: 'admin', label: 'Admin' },
  ];

  const handleFormSubmit = async (data: StaffFormValues) => {
    try {
      if (selectedStaff) {
        await updateStaff.mutateAsync({ id: selectedStaff.id, name: data.name, email: data.email || undefined, department: data.department, role: data.role as SupportStaff['role'], shift: data.shift as SupportStaff['shift'], status: data.status as SupportStaff['status'] });
        toast({ title: 'Staff updated' });
      } else {
        await createStaff.mutateAsync({ name: data.name, email: data.email || undefined, department: data.department, role: data.role as SupportStaff['role'], shift: data.shift as SupportStaff['shift'], status: data.status as SupportStaff['status'] });
        toast({ title: 'Staff added' });
      }
      setFormOpen(false);
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to save', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!staffToDelete) return;
    try {
      await deleteStaff.mutateAsync(staffToDelete.id);
      toast({ title: 'Staff removed' });
      setDeleteOpen(false);
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to delete', variant: 'destructive' });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (s: SupportStaff) => (
        <div>
          <p className="font-medium">{s.name}</p>
          {s.email && <p className="text-xs text-muted-foreground">{s.email}</p>}
        </div>
      ),
    },
    { key: 'department', header: 'Department' },
    {
      key: 'role',
      header: 'Role',
      render: (s: SupportStaff) => (
        <span className="px-2 py-0.5 rounded text-xs font-medium capitalize bg-secondary text-secondary-foreground">
          {s.role.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'shift',
      header: 'Shift',
      render: (s: SupportStaff) => <span className="capitalize">{s.shift.replace('_', ' ').replace('-', ' ')}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (s: SupportStaff) => <StatusBadge status={s.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s: SupportStaff) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedStaff(s); setFormOpen(true); }}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setStaffToDelete(s); setDeleteOpen(true); }}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Users2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Users2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
        </div>
        <div className="text-destructive">Failed to load staff data.</div>
      </div>
    );
  }

  const { paginatedData: paginatedStaff, currentPage, totalPages, totalItems, hasNextPage, hasPrevPage, nextPage, prevPage, goToPage } = usePaginatedQuery({ data: filteredData });

  const all = staff ?? [];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
        </div>
        <Button onClick={() => { setSelectedStaff(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Staff
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
          <span className="text-sm text-muted-foreground">Total:</span>
          <span className="font-semibold">{all.length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10">
          <span className="text-sm text-muted-foreground">Available:</span>
          <span className="font-semibold text-success">{all.filter((s) => s.status === 'available').length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
          <span className="text-sm text-muted-foreground">Assigned:</span>
          <span className="font-semibold text-primary">{all.filter((s) => s.status === 'assigned').length}</span>
        </div>
      </div>

      <ResourceFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        statusLabel="Status"
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        typeOptions={roleOptions}
        typeLabel="Role"
      />

      {all.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No staff yet. Add your first staff member.</div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No staff match your filters.</div>
      ) : (
        <>
          <ResourceTable data={paginatedStaff} columns={columns} />
          <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} hasNextPage={hasNextPage} hasPrevPage={hasPrevPage} nextPage={nextPage} prevPage={prevPage} goToPage={goToPage} />
        </>
      )}

      <StaffFormDialog open={formOpen} onOpenChange={setFormOpen} onSubmit={handleFormSubmit} staff={selectedStaff} isSubmitting={createStaff.isPending || updateStaff.isPending} />
      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} title="Delete Staff" description={`Remove "${staffToDelete?.name}"? This cannot be undone.`} />
    </div>
  );
}
