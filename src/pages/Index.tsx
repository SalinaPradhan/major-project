import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, BookOpen, DoorOpen, GraduationCap, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

const statCards = [
  { label: "Departments", icon: Building2, table: "departments" as const, link: "/departments" },
  { label: "Faculty", icon: Users, table: "faculty" as const, link: "/faculty" },
  { label: "Courses", icon: BookOpen, table: "courses" as const, link: "/courses" },
  { label: "Rooms", icon: DoorOpen, table: "rooms" as const, link: "/rooms" },
  { label: "Batches", icon: GraduationCap, table: "batches" as const, link: "/batches" },
  { label: "Assignments", icon: ClipboardList, table: "teaching_assignments" as const, link: "/assignments" },
];

export default function Index() {
  const { role, isAdminOrAbove, user } = useAuth();

  const counts = statCards.map((card) => {
    const { data } = useQuery({
      queryKey: [card.table, "count"],
      queryFn: async () => {
        const { count } = await supabase
          .from(card.table)
          .select("*", { count: "exact", head: true });
        return count ?? 0;
      },
    });
    return { ...card, count: data ?? 0 };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? "User"}
        </h1>
        <p className="text-muted-foreground">
          {isAdminOrAbove
            ? "Manage your university resources and schedules"
            : role === "faculty"
            ? "View your schedule and manage preferences"
            : "View your schedule and preferences"}
        </p>
      </div>

      {isAdminOrAbove && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {counts.map((card) => (
            <Link key={card.label} to={card.link}>
              <Card className="glass-card hover:border-primary/30 transition-all cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    {card.label}
                  </CardTitle>
                  <card.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{card.count}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
