import { Clock, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TodaySchedulePreview() {
  // In a full implementation this would fetch today's schedule entries
  // For now, show a placeholder
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <Card className="glass-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Today's Schedule</CardTitle>
          <span className="text-xs text-muted-foreground">{today}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No classes scheduled for today</p>
          <p className="text-xs mt-1">Schedule entries will appear here once a timetable is generated and published.</p>
        </div>
      </CardContent>
    </Card>
  );
}
