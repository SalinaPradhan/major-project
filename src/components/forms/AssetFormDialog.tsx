import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Asset } from '@/types';

export interface AssetFormValues {
  name: string;
  type: string;
  location: string;
  status: string;
  assignedTo: string;
}

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AssetFormValues) => void;
  asset?: Asset | null;
  isSubmitting?: boolean;
}

export function AssetFormDialog({ open, onOpenChange, onSubmit, asset, isSubmitting }: AssetFormDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<AssetFormValues>({
    defaultValues: { name: '', type: 'equipment', location: '', status: 'working', assignedTo: '' },
  });

  useEffect(() => {
    if (open) {
      if (asset) {
        reset({
          name: asset.name,
          type: asset.type,
          location: asset.location || '',
          status: asset.status,
          assignedTo: asset.assignedTo || '',
        });
      } else {
        reset({ name: '', type: 'equipment', location: '', status: 'working', assignedTo: '' });
      }
    }
  }, [open, asset, reset]);

  const typeValue = watch('type');
  const statusValue = watch('status');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{asset ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset-name">Name</Label>
            <Input id="asset-name" {...register('name', { required: true })} placeholder="Projector A1" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={typeValue} onValueChange={(v) => setValue('type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="projector">Projector</SelectItem>
                <SelectItem value="computer">Computer</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="asset-location">Location</Label>
            <Input id="asset-location" {...register('location')} placeholder="Building A, Room 101" />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusValue} onValueChange={(v) => setValue('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="broken">Broken</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="asset-assigned">Assigned To</Label>
            <Input id="asset-assigned" {...register('assignedTo')} placeholder="Faculty name or department" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {asset ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
