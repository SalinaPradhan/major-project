import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types';

function transformAsset(row: any): Asset {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    location: row.location ?? '',
    status: row.status,
    assignedTo: row.assigned_to ?? undefined,
  };
}

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(transformAsset);
    },
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (asset: Omit<Asset, 'id'>) => {
      const { error } = await supabase.from('assets').insert({
        name: asset.name,
        type: asset.type,
        location: asset.location || null,
        status: asset.status,
        assigned_to: asset.assignedTo || null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (asset: Partial<Asset> & { id: string }) => {
      const { error } = await supabase
        .from('assets')
        .update({
          name: asset.name,
          type: asset.type,
          location: asset.location || null,
          status: asset.status,
          assigned_to: asset.assignedTo || null,
        })
        .eq('id', asset.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }),
  });
}
