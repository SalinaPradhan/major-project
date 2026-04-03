import { useState } from 'react';
import { Plus, Projector, Monitor, Wrench, Sofa, Pencil, Trash2, Package } from 'lucide-react';
import { ResourceFilters, FilterOption } from '@/components/resources/ResourceFilters';
import { StatusBadge } from '@/components/resources/StatusBadge';
import { ResourceTable } from '@/components/resources/ResourceTable';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/useAssets';
import { useResourceFilters } from '@/hooks/useResourceFilters';
import { AssetFormDialog, AssetFormValues } from '@/components/forms/AssetFormDialog';
import { DeleteConfirmDialog } from '@/components/forms/DeleteConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { Asset } from '@/types';

const typeIcons: Record<string, any> = {
  projector: Projector,
  computer: Monitor,
  equipment: Wrench,
  furniture: Sofa,
};

export default function Assets() {
  const { data: assets, isLoading, error } = useAssets();
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  const { search, setSearch, statusFilter, setStatusFilter, typeFilter, setTypeFilter, filteredData } =
    useResourceFilters({
      data: assets,
      searchFields: ['name', 'location', 'assignedTo'] as (keyof Asset)[],
      statusField: 'status',
      typeField: 'type',
    });

  const statusOptions: FilterOption[] = [
    { value: 'working', label: 'Working' },
    { value: 'broken', label: 'Broken' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  const typeOptions: FilterOption[] = [
    { value: 'projector', label: 'Projector' },
    { value: 'computer', label: 'Computer' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'furniture', label: 'Furniture' },
  ];

  const handleFormSubmit = async (data: AssetFormValues) => {
    try {
      if (selectedAsset) {
        await updateAsset.mutateAsync({ id: selectedAsset.id, name: data.name, type: data.type as Asset['type'], location: data.location, status: data.status as Asset['status'], assignedTo: data.assignedTo || undefined });
        toast({ title: 'Asset updated' });
      } else {
        await createAsset.mutateAsync({ name: data.name, type: data.type as Asset['type'], location: data.location, status: data.status as Asset['status'], assignedTo: data.assignedTo || undefined });
        toast({ title: 'Asset created' });
      }
      setFormOpen(false);
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to save', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!assetToDelete) return;
    try {
      await deleteAsset.mutateAsync(assetToDelete.id);
      toast({ title: 'Asset deleted' });
      setDeleteOpen(false);
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to delete', variant: 'destructive' });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Asset',
      render: (a: Asset) => {
        const Icon = typeIcons[a.type] || Wrench;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{a.name}</p>
              <p className="text-xs text-muted-foreground">{a.id.slice(0, 8)}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      render: (a: Asset) => (
        <span className="px-2 py-0.5 rounded text-xs font-medium capitalize bg-secondary text-secondary-foreground">{a.type}</span>
      ),
    },
    { key: 'location', header: 'Location' },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      render: (a: Asset) => <span>{a.assignedTo || <span className="text-muted-foreground">—</span>}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (a: Asset) => <StatusBadge status={a.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (a: Asset) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedAsset(a); setFormOpen(true); }}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setAssetToDelete(a); setDeleteOpen(true); }}>
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
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Assets</h1>
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
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Assets</h1>
        </div>
        <div className="text-destructive">Failed to load assets.</div>
      </div>
    );
  }

  const all = assets ?? [];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Assets</h1>
        </div>
        <Button onClick={() => { setSelectedAsset(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Asset
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
          <span className="text-sm text-muted-foreground">Total:</span>
          <span className="font-semibold">{all.length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10">
          <span className="text-sm text-muted-foreground">Working:</span>
          <span className="font-semibold text-success">{all.filter((a) => a.status === 'working').length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10">
          <span className="text-sm text-muted-foreground">Broken:</span>
          <span className="font-semibold text-destructive">{all.filter((a) => a.status === 'broken').length}</span>
        </div>
      </div>

      <ResourceFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assets..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        statusLabel="Status"
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        typeOptions={typeOptions}
        typeLabel="Type"
      />

      {all.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No assets yet. Add your first asset to get started.</div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No assets match your filters.</div>
      ) : (
        <ResourceTable data={filteredData} columns={columns} />
      )}

      <AssetFormDialog open={formOpen} onOpenChange={setFormOpen} onSubmit={handleFormSubmit} asset={selectedAsset} isSubmitting={createAsset.isPending || updateAsset.isPending} />
      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} title="Delete Asset" description={`Delete "${assetToDelete?.name}"? This cannot be undone.`} />
    </div>
  );
}
