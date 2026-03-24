import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BatchInsert = Database["public"]["Tables"]["batches"]["Insert"];
type BatchUpdate = Database["public"]["Tables"]["batches"]["Update"];

export const useBatches = () =>
  useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select("*, departments(name, code)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

export const useCreateBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (batch: BatchInsert) => {
      const { data, error } = await supabase.from("batches").insert(batch).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["batches"] }),
  });
};

export const useUpdateBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: BatchUpdate & { id: string }) => {
      const { data, error } = await supabase.from("batches").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["batches"] }),
  });
};

export const useDeleteBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("batches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["batches"] }),
  });
};
