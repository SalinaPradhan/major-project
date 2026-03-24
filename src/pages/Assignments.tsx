import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Link2 } from "lucide-react";
import { useFaculty } from "@/hooks/useFaculty";
import { useCourses } from "@/hooks/useCourses";
import { useBatches } from "@/hooks/useBatches";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const useAssignments = () =>
  useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teaching_assignments")
        .select("*, faculty(name), courses(name, code), batches(name, section)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

const Assignments = () => {
  const { data: assignments, isLoading } = useAssignments();
  const { data: faculty } = useFaculty();
  const { data: courses } = useCourses();
  const { data: batches } = useBatches();
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (a: { faculty_id: string; course_id: string; batch_id: string; is_lab: boolean }) => {
      const { data, error } = await supabase.from("teaching_assignments").insert(a).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teaching_assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ faculty_id: "", course_id: "", batch_id: "", is_lab: false });

  const handleSave = async () => {
    try {
      await createMutation.mutateAsync(form);
      toast.success("Assignment created");
      setOpen(false);
      setForm({ faculty_id: "", course_id: "", batch_id: "", is_lab: false });
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this assignment?")) return;
    try { await deleteMutation.mutateAsync(id); toast.success("Deleted"); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <PageHeader title="Teaching Assignments" description="Assign faculty to courses and batches">
        <Button size="sm" onClick={() => setOpen(true)}><Plus size={16} className="mr-1" /> Add Assignment</Button>
      </PageHeader>
      <div className="p-6">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : !assignments?.length ? (
          <Card className="p-8 flex items-center justify-center text-muted-foreground">
            <div className="text-center"><Link2 size={48} className="mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">No assignments yet</p><p className="text-xs mt-1">Add faculty, courses, and batches first</p></div>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead><TableHead>Course</TableHead><TableHead>Batch</TableHead><TableHead>Lab?</TableHead><TableHead className="w-16">Del</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{(a as any).faculty?.name}</TableCell>
                    <TableCell>{(a as any).courses?.code} — {(a as any).courses?.name}</TableCell>
                    <TableCell>{(a as any).batches?.name}-{(a as any).batches?.section}</TableCell>
                    <TableCell>{a.is_lab ? "Yes" : "No"}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(a.id)}><Trash2 size={14} /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Teaching Assignment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Faculty *</Label>
              <Select value={form.faculty_id} onValueChange={(v) => setForm({ ...form, faculty_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                <SelectContent>{faculty?.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Course *</Label>
              <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>{courses?.map((c) => <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Batch *</Label>
              <Select value={form.batch_id} onValueChange={(v) => setForm({ ...form, batch_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                <SelectContent>{batches?.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}-{b.section}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.is_lab} onCheckedChange={(v) => setForm({ ...form, is_lab: !!v })} />
              <Label>Is Lab Session</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.faculty_id || !form.course_id || !form.batch_id}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assignments;
