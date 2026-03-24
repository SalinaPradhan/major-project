import PageHeader from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Calendar, BookOpen, Clock, GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const StudentDashboard = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["student-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, student_id, batch_id")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: batch } = useQuery({
    queryKey: ["student-batch", profile?.batch_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("batches")
        .select("name, section, semester, department_id")
        .eq("id", profile!.batch_id!)
        .single();
      return data;
    },
    enabled: !!profile?.batch_id,
  });

  // Get courses for this batch
  const { data: assignments } = useQuery({
    queryKey: ["student-assignments", profile?.batch_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("teaching_assignments")
        .select(`
          id, is_lab,
          course:courses(name, code, credit_hours),
          faculty:faculty(name)
        `)
        .eq("batch_id", profile!.batch_id!);
      return data ?? [];
    },
    enabled: !!profile?.batch_id,
  });

  // Published schedules
  const { data: scheduleCount } = useQuery({
    queryKey: ["published-schedules-student"],
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
        title={`Welcome, ${profile?.display_name ?? "Student"}`}
        description="Your timetable and course information"
      />
      <div className="p-6 space-y-6">
        {/* Quick info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {batch ? `${batch.name} - ${batch.section}` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {batch ? `Semester ${batch.semester}` : "Batch"}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{assignments?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Courses This Semester</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{scheduleCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Published Timetables</p>
              </div>
            </div>
          </Card>
        </div>

        {/* My Courses */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">My Courses</h2>
          {!assignments?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No courses assigned to your batch yet</p>
              <p className="text-xs mt-1">Check back later or contact your department</p>
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
                      {a.faculty?.name} · {a.course?.credit_hours} credits
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

        {/* Student ID */}
        {profile?.student_id && (
          <p className="text-xs text-muted-foreground text-center">Student ID: {profile.student_id}</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
