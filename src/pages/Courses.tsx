import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Course = Tables<"courses">;

export default function Courses() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [creditHours, setCreditHours] = useState("3");
  const [lectureHours, setLectureHours] = useState("3");
  const [labHours, setLabHours] = useState("0");
  const [requiresLab, setRequiresLab] = useState(false);
  const [departmentId, setDepartmentId] = useState("");

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*, departments(name)").order("code");
      if (error) throw error;
      return data;
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await supabase.from("departments").select("*").order("name");
      return data ?? [];
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = {
        code,
        name,
        credit_hours: parseInt(creditHours),
        lecture_hours: parseInt(lectureHours),
        lab_hours: parseInt(labHours),
        requires_lab: requiresLab,
        department_id: departmentId || null,
      };
      if (editing) {
        const { error } = await supabase.from("courses").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: editing ? "Course updated" : "Course created" });
      closeDialog();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openEdit = (c: Course) => {
    setEditing(c);
    setCode(c.code);
    setName(c.name);
    setCreditHours(String(c.credit_hours));
    setLectureHours(String(c.lecture_hours));
    setLabHours(String(c.lab_hours));
    setRequiresLab(c.requires_lab);
    setDepartmentId(c.department_id ?? "");
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
    setCode("");
    setName("");
    setCreditHours("3");
    setLectureHours("3");
    setLabHours("0");
    setRequiresLab(false);
    setDepartmentId("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Courses</h1>
        <Dialog open={open} onOpenChange={(o) => { if (!o) closeDialog(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Course</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Add"} Course</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); upsert.mutate(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Credits</Label>
                  <Input type="number" value={creditHours} onChange={(e) => setCreditHours(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Lecture Hrs</Label>
                  <Input type="number" value={lectureHours} onChange={(e) => setLectureHours(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Lab Hrs</Label>
                  <Input type="number" value={labHours} onChange={(e) => setLabHours(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={requiresLab} onCheckedChange={(v) => setRequiresLab(!!v)} />
                <Label>Requires Lab</Label>
              </div>
              <Button type="submit" className="w-full" disabled={upsert.isPending}>
                {editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Lecture</TableHead>
              <TableHead>Lab</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono">{c.code}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.departments?.name ?? "—"}</TableCell>
                <TableCell>{c.credit_hours}</TableCell>
                <TableCell>{c.lecture_hours}</TableCell>
                <TableCell>{c.lab_hours}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
