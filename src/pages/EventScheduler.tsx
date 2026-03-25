import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function EventScheduler() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <CalendarIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Event Scheduler</h1>
      </div>
      <Card className="glass-card">
        <CardContent className="pt-6 text-center py-12">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Event scheduling for venue bookings, exams, and special events is coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
