import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Clock, GraduationCap, ArrowLeftRight } from 'lucide-react';

interface FacultyMetricsProps {
  todayClasses: number;
  nextClassTime: string | null;
  weeklyLoad: number;
  maxWeeklyHours: number;
  semesterCourses: number;
  lectureCount: number;
  labCount: number;
  tutorialCount: number;
  pendingSwaps: number;
}

export function FacultyMetrics({
  todayClasses,
  nextClassTime,
  weeklyLoad,
  maxWeeklyHours,
  semesterCourses,
  lectureCount,
  labCount,
  tutorialCount,
  pendingSwaps,
}: FacultyMetricsProps) {
  const loadPercent = maxWeeklyHours > 0 ? Math.round((weeklyLoad / maxWeeklyHours) * 100) : 0;

  const cards = [
    {
      icon: BookOpen,
      label: "Today's Classes",
      value: todayClasses,
      sub: nextClassTime ? `Next at ${nextClassTime}` : 'No more classes',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Clock,
      label: 'Weekly Load',
      value: `${weeklyLoad}/${maxWeeklyHours}`,
      sub: `${loadPercent}% utilized`,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: GraduationCap,
      label: 'Semester Courses',
      value: semesterCourses,
      sub: `${lectureCount} lec · ${labCount} lab · ${tutorialCount} tut`,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      icon: ArrowLeftRight,
      label: 'Swap Requests',
      value: pendingSwaps,
      sub: pendingSwaps === 1 ? '1 pending' : `${pendingSwaps} pending`,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${c.bg}`}>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-xl font-bold text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.sub}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
