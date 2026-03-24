import PageHeader from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Calendar, BookOpen, Clock, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const FacultyDashboard = () => {
  const { user } = useAuth();

  // Find the faculty record linked to this user's profile
  const { data: profile } = useQuery({
    queryKey: ["faculty-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, department_id, faculty_code")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Get teaching assignments for faculty in same department
  const { data: assignments } = useQuery({
    queryKey: ["faculty-assignments", profile?.department_id],
    queryFn: async () => {
      const { data: facultyRecords } = await supabase
        .from("faculty")
        .select("id")
        .eq("department_id", profile!.department_id!);

      if (!facultyRecords?.length) return [];

      const facultyIds = facultyRecords.map(f => f.id);
      const { data } = await supabase
        .from("teaching_assignments")
        .select(`
          id, is_lab,
          course:courses(name, code),
          batch:batches(name, section),
          faculty:faculty(name)
        `)
        .in("faculty_id", facultyIds);
      return data ?? [];
    },
    enabled: !!profile?.department_id,
  });

  // Published schedules count
  const { data: scheduleCount } = useQuery({
    queryKey: ["published-schedules"],
    queryFn: async () => {
      const { count } = await supabase
        .from("schedules")
        .select("id", { count: "exact", head: true })
        .eq("status", "published");
      return count ?? 0;
    },
  });

  return (
    <div>
      <PageHeader
        title={`Welcome, ${profile?.display_name ?? "Faculty"}`}
        description="Your teaching overview and schedule"
      />
      <div className="p-6 space-y-6">
        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{assignments?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Teaching Assignments</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{scheduleCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Published Schedules</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <User size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{profile?.faculty_code || "—"}</p>
                <p className="text-xs text-muted-foreground">Faculty Code</p>
              </div>
            </div>
          </Card>
        </div>

        {/* My Courses */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">My Courses & Assignments</h2>
          {!assignments?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No teaching assignments found</p>
              <p className="text-xs mt-1">Contact your admin to assign courses</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-md border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {a.course?.code} — {a.course?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.faculty?.name} · {a.batch?.name} ({a.batch?.section})
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    a.is_lab ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {a.is_lab ? "Lab" : "Lecture"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default FacultyDashboard;
