import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];
type CourseUpdate = Database["public"]["Tables"]["courses"]["Update"];

export const useCourses = () =>
  useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, departments(name, code)")
        .order("code");
      if (error) throw error;
      return data;
    },
  });

export const useCreateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (course: CourseInsert) => {
      const { data, error } = await supabase.from("courses").insert(course).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
};

export const useUpdateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: CourseUpdate & { id: string }) => {
      const { data, error } = await supabase.from("courses").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
};
