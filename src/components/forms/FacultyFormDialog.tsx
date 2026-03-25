import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateFaculty, useUpdateFaculty } from '@/hooks/useFaculty';
import { useDepartments } from '@/hooks/useDepartments';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

const facultySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  department_id: z.string().optional(),
  max_hours_per_day: z.coerce.number().min(1).max(12),
  max_hours_per_week: z.coerce.number().min(1).max(40),
});

type FacultyFormValues = z.infer<typeof facultySchema>;

interface FacultyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty?: Tables<'faculty'> | null;
}

export function FacultyFormDialog({ open, onOpenChange, faculty }: FacultyFormDialogProps) {
  const createFaculty = useCreateFaculty();
  const updateFaculty = useUpdateFaculty();
  const { data: departments } = useDepartments();
  const isEditing = !!faculty;

  const form = useForm<FacultyFormValues>({
    resolver: zodResolver(facultySchema),
    defaultValues: {
      name: '',
      email: '',
      department_id: '',
      max_hours_per_day: 6,
      max_hours_per_week: 18,
    },
  });

  useEffect(() => {
    if (faculty) {
      form.reset({
        name: faculty.name,
        email: faculty.email || '',
        department_id: faculty.department_id || '',
        max_hours_per_day: faculty.max_hours_per_day,
        max_hours_per_week: faculty.max_hours_per_week,
      });
    } else {
      form.reset({
        name: '',
        email: '',
        department_id: '',
        max_hours_per_day: 6,
        max_hours_per_week: 18,
      });
    }
  }, [faculty, form]);

  const onSubmit = async (values: FacultyFormValues) => {
    try {
      const payload = {
        name: values.name,
        email: values.email || null,
        department_id: values.department_id || null,
        max_hours_per_day: values.max_hours_per_day,
        max_hours_per_week: values.max_hours_per_week,
      };

      if (isEditing && faculty) {
        await updateFaculty.mutateAsync({ id: faculty.id, ...payload });
        toast.success('Faculty updated successfully');
      } else {
        await createFaculty.mutateAsync(payload);
        toast.success('Faculty created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save faculty');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Jane Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jane@university.edu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="max_hours_per_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Hours/Day</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={12} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_hours_per_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Hours/Week</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={40} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createFaculty.isPending || updateFaculty.isPending}>
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
