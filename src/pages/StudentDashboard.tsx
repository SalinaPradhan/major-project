import { useAuth } from '@/contexts/AuthContext';
import { TodaySchedulePreview } from '@/components/dashboard/TodaySchedulePreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'Student';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome, {displayName}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Timetable</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Link to="/timetable"><Button variant="outline" className="w-full">View Timetable</Button></Link>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Link to="/courses"><Button variant="outline" className="w-full">View Courses</Button></Link>
          </CardContent>
        </Card>
      </div>
      <TodaySchedulePreview />
    </div>
  );
}
