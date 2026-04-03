import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SupportStaff } from '@/types';

function transformStaff(row: any): SupportStaff {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    role: row.role,
    department: row.department,
    shift: row.shift,
    status: row.status,
  };
}

export function useStaff() {
  return useQuery({
    queryKey: ['support_staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_staff')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(transformStaff);
    },
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (staff: Omit<SupportStaff, 'id'>) => {
      const { error } = await supabase.from('support_staff').insert({
        name: staff.name,
        email: staff.email || null,
        department: staff.department,
        role: staff.role,
        shift: staff.shift,
        status: staff.status,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support_staff'] }),
  });
}

export function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (staff: Partial<SupportStaff> & { id: string }) => {
      const { error } = await supabase
        .from('support_staff')
        .update({
          name: staff.name,
          email: staff.email || null,
          department: staff.department,
          role: staff.role,
          shift: staff.shift,
          status: staff.status,
        })
        .eq('id', staff.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support_staff'] }),
  });
}

export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('support_staff').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support_staff'] }),
  });
}
