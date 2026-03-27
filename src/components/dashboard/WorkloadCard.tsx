import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

interface WorkloadCardProps {
  currentHours: number;
  maxHours: number;
  lectureHours: number;
  labHours: number;
  tutorialHours: number;
}

export function WorkloadCard({ currentHours, maxHours, lectureHours, labHours, tutorialHours }: WorkloadCardProps) {
  const percent = maxHours > 0 ? Math.round((currentHours / maxHours) * 100) : 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Workload This Semester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold text-foreground">{currentHours}/{maxHours} hrs</span>
            <span className="text-sm text-muted-foreground">{percent}%</span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>
        <div className="space-y-2">
          {[
            { label: 'Lectures', hours: lectureHours, color: 'bg-blue-400' },
            { label: 'Labs', hours: labHours, color: 'bg-emerald-400' },
            { label: 'Tutorials', hours: tutorialHours, color: 'bg-amber-400' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
              <span className="text-foreground font-medium">{item.hours} hrs</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
