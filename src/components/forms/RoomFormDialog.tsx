import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateRoom, useUpdateRoom } from '@/hooks/useRooms';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

const roomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  room_type: z.enum(['classroom', 'lab', 'auditorium', 'conference_hall', 'indoor_stadium', 'cineplex']),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  building: z.string().optional(),
  floor: z.coerce.number().optional(),
  has_projector: z.boolean(),
});

type RoomFormValues = z.infer<typeof roomSchema>;

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: Tables<'rooms'> | null;
}

export function RoomFormDialog({ open, onOpenChange, room }: RoomFormDialogProps) {
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const isEditing = !!room;

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: '',
      room_type: 'classroom',
      capacity: 30,
      building: '',
      floor: undefined,
      has_projector: true,
    },
  });

  useEffect(() => {
    if (room) {
      form.reset({
        name: room.name,
        room_type: room.room_type,
        capacity: room.capacity,
        building: room.building || '',
        floor: room.floor ?? undefined,
        has_projector: room.has_projector,
      });
    } else {
      form.reset({
        name: '',
        room_type: 'classroom',
        capacity: 30,
        building: '',
        floor: undefined,
        has_projector: true,
      });
    }
  }, [room, form]);

  const onSubmit = async (values: RoomFormValues) => {
    try {
      const payload = {
        name: values.name,
        room_type: values.room_type,
        capacity: values.capacity,
        has_projector: values.has_projector,
        building: values.building || null,
        floor: values.floor ?? null,
      };

      if (isEditing && room) {
        await updateRoom.mutateAsync({ id: room.id, ...payload });
        toast.success('Room updated successfully');
      } else {
        await createRoom.mutateAsync(payload);
        toast.success('Room created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save room');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Room 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="room_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="classroom">Classroom</SelectItem>
                        <SelectItem value="lab">Lab</SelectItem>
                        <SelectItem value="auditorium">Auditorium</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Block A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 1" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="has_projector"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="cursor-pointer">Has Projector</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRoom.isPending || updateRoom.isPending}>
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
