import PageHeader from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Users, BookOpen, DoorOpen, GraduationCap, Calendar, AlertTriangle, Building2, Link2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const useStats = () =>
  useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [faculty, courses, rooms, batches, departments, assignments, schedules] = await Promise.all([
        supabase.from("faculty").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("rooms").select("id", { count: "exact", head: true }),
        supabase.from("batches").select("id", { count: "exact", head: true }),
        supabase.from("departments").select("id", { count: "exact", head: true }),
        supabase.from("teaching_assignments").select("id", { count: "exact", head: true }),
        supabase.from("schedules").select("id, name, status, fitness_score, hard_constraint_violations, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      return {
        faculty: faculty.count ?? 0,
        courses: courses.count ?? 0,
        rooms: rooms.count ?? 0,
        batches: batches.count ?? 0,
        departments: departments.count ?? 0,
        assignments: assignments.count ?? 0,
        recentSchedules: schedules.data ?? [],
      };
    },
  });

const Index = () => {
  const { data: stats, isLoading } = useStats();

  const statCards = [
    { label: "Departments", value: stats?.departments ?? 0, icon: Building2 },
    { label: "Faculty", value: stats?.faculty ?? 0, icon: Users },
    { label: "Courses", value: stats?.courses ?? 0, icon: BookOpen },
    { label: "Rooms", value: stats?.rooms ?? 0, icon: DoorOpen },
    { label: "Batches", value: stats?.batches ?? 0, icon: GraduationCap },
    { label: "Assignments", value: stats?.assignments ?? 0, icon: Link2 },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="University Resource Scheduling System — Overview" />
      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center gap-3">
                <stat.icon size={20} className="text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? "—" : stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent schedules */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Recent Schedules</h2>
          {!stats?.recentSchedules?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No schedules generated yet</p>
              <p className="text-xs mt-1">Add data and go to Generate to create timetables</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentSchedules.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-md border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()} · Fitness: {s.fitness_score?.toFixed(2) ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.hard_constraint_violations > 0 && (
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <AlertTriangle size={12} /> {s.hard_constraint_violations} violations
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;
