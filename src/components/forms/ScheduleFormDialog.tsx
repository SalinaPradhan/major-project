import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateSchedule, useUpdateSchedule } from '@/hooks/useSchedules';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

const scheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  status: z.enum(['draft', 'published', 'archived']),
  population_size: z.coerce.number().min(10).max(500).optional(),
  generation_count: z.coerce.number().min(10).max(2000).optional(),
  mutation_rate: z.coerce.number().min(0.01).max(1).optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: Tables<'schedules'> | null;
}

export function ScheduleFormDialog({ open, onOpenChange, schedule }: ScheduleFormDialogProps) {
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const isEditing = !!schedule;

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      name: '',
      status: 'draft',
      population_size: 50,
      generation_count: 200,
      mutation_rate: 0.1,
    },
  });

  useEffect(() => {
    if (schedule) {
      form.reset({
        name: schedule.name,
        status: schedule.status,
        population_size: schedule.population_size ?? 50,
        generation_count: schedule.generation_count ?? 200,
        mutation_rate: schedule.mutation_rate ?? 0.1,
      });
    } else {
      form.reset({
        name: '',
        status: 'draft',
        population_size: 50,
        generation_count: 200,
        mutation_rate: 0.1,
      });
    }
  }, [schedule, form]);

  const onSubmit = async (values: ScheduleFormValues) => {
    try {
      const payload = {
        name: values.name,
        status: values.status,
        population_size: values.population_size ?? null,
        generation_count: values.generation_count ?? null,
        mutation_rate: values.mutation_rate ?? null,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
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
                    <Input placeholder="e.g. Spring 2026 Timetable" {...field} />
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
