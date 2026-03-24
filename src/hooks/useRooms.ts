import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type RoomInsert = Database["public"]["Tables"]["rooms"]["Insert"];
type RoomUpdate = Database["public"]["Tables"]["rooms"]["Update"];

export const useRooms = () =>
  useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

export const useCreateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (room: RoomInsert) => {
      const { data, error } = await supabase.from("rooms").insert(room).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
};

export const useUpdateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: RoomUpdate & { id: string }) => {
      const { data, error } = await supabase.from("rooms").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
};

export const useDeleteRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
};
