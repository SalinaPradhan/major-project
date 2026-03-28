import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Workload This Semester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold text-foreground">{currentHours}/{maxHours} hrs</span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: '#EAF3DE', color: '#27500A' }}
            >
              On track
            </span>
          </div>

          {/* Custom progress bar */}
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(percent, 100)}%`, background: '#3B6D11' }}
            />
          </div>

          {/* Labels below bar */}
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>0 hrs</span>
            <span>Safe zone</span>
            <span>{maxHours} hrs max</span>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { label: 'Lectures', hours: lectureHours, dot: '#185FA5' },
            { label: 'Labs', hours: labHours, dot: '#3B6D11' },
            { label: 'Tutorials', hours: tutorialHours, dot: '#854F0B' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.dot }} />
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
