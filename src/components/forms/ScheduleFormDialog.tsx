import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateSchedule, useUpdateSchedule } from '@/hooks/useSchedules';
import { useDepartments } from '@/hooks/useDepartments';
import { useBatches } from '@/hooks/useBatches';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

const scheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  status: z.enum(['draft', 'published', 'archived']),
  population_size: z.coerce.number().min(10).max(500).optional(),
  generation_count: z.coerce.number().min(10).max(2000).optional(),
  mutation_rate: z.coerce.number().min(0.01).max(1).optional(),
  department_id: z.string().nullable().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: (Tables<'schedules'> & { batch_ids?: string[] }) | null;
}

export function ScheduleFormDialog({ open, onOpenChange, schedule }: ScheduleFormDialogProps) {
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const { data: departments = [] } = useDepartments();
  const { data: allBatches = [] } = useBatches();
  const isEditing = !!schedule;

  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      name: '',
      status: 'draft',
      population_size: 50,
      generation_count: 200,
      mutation_rate: 0.1,
      department_id: null,
    },
  });

  const watchedDeptId = form.watch('department_id');

  const filteredBatches = watchedDeptId && watchedDeptId !== '__all__'
    ? allBatches.filter((b: any) => b.department_id === watchedDeptId)
    : allBatches;

  useEffect(() => {
    if (schedule) {
      form.reset({
        name: schedule.name,
        status: schedule.status,
        population_size: schedule.population_size ?? 50,
        generation_count: schedule.generation_count ?? 200,
        mutation_rate: schedule.mutation_rate ?? 0.1,
        department_id: (schedule as any).department_id ?? null,
      });
      setSelectedBatchIds((schedule as any).batch_ids ?? []);
    } else {
      form.reset({
        name: '',
        status: 'draft',
        population_size: 50,
        generation_count: 200,
        mutation_rate: 0.1,
        department_id: null,
      });
      setSelectedBatchIds([]);
    }
  }, [schedule, form]);

  // Reset batch selection when department changes
  useEffect(() => {
    if (!isEditing) {
      setSelectedBatchIds([]);
    }
  }, [watchedDeptId, isEditing]);

  const onSubmit = async (values: ScheduleFormValues) => {
    try {
      const deptId = values.department_id === '__all__' ? null : (values.department_id || null);
      const payload: any = {
        name: values.name,
        status: values.status,
        population_size: values.population_size ?? null,
        generation_count: values.generation_count ?? null,
        mutation_rate: values.mutation_rate ?? null,
        department_id: deptId,
        batch_ids: selectedBatchIds.length > 0 ? selectedBatchIds : [],
      };

      if (isEditing && schedule) {
        await updateSchedule.mutateAsync({ id: schedule.id, ...payload });
        toast.success('Schedule updated successfully');
      } else {
        await createSchedule.mutateAsync(payload);
        toast.success('Schedule created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save schedule');
    }
  };

  const toggleBatch = (batchId: string) => {
    setSelectedBatchIds(prev =>
      prev.includes(batchId) ? prev.filter(id => id !== batchId) : [...prev, batchId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CSE Dept — Spring 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scope: Department */}
            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department (optional scope)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? '__all__'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__all__">All Departments</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scope: Batches */}
            {filteredBatches.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Batches (optional — leave empty for all)</FormLabel>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto rounded-md border border-border p-3">
                  {filteredBatches.map((b: any) => (
                    <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedBatchIds.includes(b.id)}
                        onCheckedChange={() => toggleBatch(b.id)}
                      />
                      <span className="text-foreground">{b.name} {b.section && `(${b.section})`}</span>
                    </label>
                  ))}
                </div>
                {selectedBatchIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">{selectedBatchIds.length} batch(es) selected</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="population_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Population</FormLabel>
                    <FormControl>
                      <Input type="number" min={10} max={500} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="generation_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Generations</FormLabel>
                    <FormControl>
                      <Input type="number" min={10} max={2000} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mutation_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mutation Rate</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.01} min={0.01} max={1} {...field} />
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
              <Button type="submit" disabled={createSchedule.isPending || updateSchedule.isPending}>
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
