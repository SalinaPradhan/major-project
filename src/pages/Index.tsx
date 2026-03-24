import PageHeader from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Users, BookOpen, DoorOpen, GraduationCap, Calendar, AlertTriangle } from "lucide-react";

const stats = [
  { label: "Faculty", value: "0", icon: Users, color: "text-primary" },
  { label: "Courses", value: "0", icon: BookOpen, color: "text-primary" },
  { label: "Rooms", value: "0", icon: DoorOpen, color: "text-primary" },
  { label: "Batches", value: "0", icon: GraduationCap, color: "text-primary" },
  { label: "Schedules", value: "0", icon: Calendar, color: "text-primary" },
  { label: "Conflicts", value: "0", icon: AlertTriangle, color: "text-destructive" },
];

const Index = () => {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="University Resource Scheduling System — Overview"
      />
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center gap-3">
                <stat.icon size={20} className={stat.color} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-6 p-8 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Calendar size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No schedules generated yet</p>
            <p className="text-xs mt-1">Add faculty, courses, rooms, and batches to get started</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
