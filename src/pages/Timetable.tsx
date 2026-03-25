import { useState } from 'react';
import { useSchedules } from '@/hooks/useSchedules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export default function Timetable() {
  const { data: schedules = [] } = useSchedules();
  const published = schedules.filter((s) => s.status === 'published');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Timetable</h1>
        </div>
        {published.length > 0 && (
          <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select a published schedule" /></SelectTrigger>
            <SelectContent>{published.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        )}
      </div>
      {!selectedScheduleId ? (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-12">
              {published.length === 0 ? 'No published timetables available yet.' : 'Select a published schedule above to view the timetable.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {DAYS.map((day) => (
            <Card key={day} className="glass-card">
              <CardHeader className="py-3"><CardTitle className="text-sm font-medium capitalize">{day}</CardTitle></CardHeader>
              <CardContent className="py-2"><p className="text-xs text-muted-foreground">Schedule entries will appear here once generated.</p></CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
