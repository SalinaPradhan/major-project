import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Faculty = Database["public"]["Tables"]["faculty"]["Row"];
type FacultyInsert = Database["public"]["Tables"]["faculty"]["Insert"];
type FacultyUpdate = Database["public"]["Tables"]["faculty"]["Update"];

export const useFaculty = () =>
  useQuery({
    queryKey: ["faculty"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faculty")
        .select("*, departments(name, code)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

export const useCreateFaculty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (faculty: FacultyInsert) => {
      const { data, error } = await supabase.from("faculty").insert(faculty).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faculty"] }),
  });
};

export const useUpdateFaculty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: FacultyUpdate & { id: string }) => {
      const { data, error } = await supabase.from("faculty").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faculty"] }),
  });
};

export const useDeleteFaculty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faculty").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faculty"] }),
  });
};
