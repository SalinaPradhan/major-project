import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { SupportStaff } from '@/types';

export interface StaffFormValues {
  name: string;
  email: string;
  department: string;
  role: string;
  shift: string;
  status: string;
}

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StaffFormValues) => void;
  staff?: SupportStaff | null;
  isSubmitting?: boolean;
}

export function StaffFormDialog({ open, onOpenChange, onSubmit, staff, isSubmitting }: StaffFormDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<StaffFormValues>({
    defaultValues: { name: '', email: '', department: '', role: 'lab_assistant', shift: 'full-day', status: 'available' },
  });

  useEffect(() => {
    if (open) {
      if (staff) {
        reset({
          name: staff.name,
          email: staff.email || '',
          department: staff.department,
          role: staff.role,
          shift: staff.shift,
          status: staff.status,
        });
      } else {
        reset({ name: '', email: '', department: '', role: 'lab_assistant', shift: 'full-day', status: 'available' });
      }
    }
  }, [open, staff, reset]);

  const roleValue = watch('role');
  const shiftValue = watch('shift');
  const statusValue = watch('status');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{staff ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staff-name">Name</Label>
            <Input id="staff-name" {...register('name', { required: true })} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-email">Email</Label>
            <Input id="staff-email" type="email" {...register('email')} placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-department">Department</Label>
            <Input id="staff-department" {...register('department', { required: true })} placeholder="Computer Science" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={roleValue} onValueChange={(v) => setValue('role', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lab_assistant">Lab Assistant</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Shift</Label>
            <Select value={shiftValue} onValueChange={(v) => setValue('shift', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="full-day">Full Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusValue} onValueChange={(v) => setValue('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {staff ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
