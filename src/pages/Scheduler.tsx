import { useState } from 'react';
import { useSchedules, useDeleteSchedule } from '@/hooks/useSchedules';
import { useGenerateTimetable } from '@/hooks/useGenerateTimetable';
import { ScheduleFormDialog } from '@/components/forms/ScheduleFormDialog';
import { DeleteConfirmDialog } from '@/components/forms/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Trash2, Pencil, Cpu, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-emerald-500/20 text-emerald-400',
  archived: 'bg-amber-500/20 text-amber-400',
};

export default function Scheduler() {
  const { data: schedules = [], isLoading } = useSchedules();
  const deleteSchedule = useDeleteSchedule();
  const generateTimetable = useGenerateTimetable();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Tables<'schedules'> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleGenerate = async (schedule: Tables<'schedules'>) => {
    try {
      toast.info('Generating timetable... This may take a moment.');
      await generateTimetable.mutateAsync({
        scheduleId: schedule.id,
        populationSize: schedule.population_size ?? 50,
        generationCount: schedule.generation_count ?? 200,
        mutationRate: schedule.mutation_rate ?? 0.1,
      });
      toast.success('Timetable generated successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate timetable');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteSchedule.mutateAsync(deleteId); toast.success('Schedule deleted'); } catch (e: any) { toast.error(e.message); }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cpu className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">AI Scheduler</h1>
          <Badge variant="secondary">{schedules.length}</Badge>
        </div>
        <Button onClick={() => { setEditingSchedule(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />New Schedule
        </Button>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Loading schedules...</p>
      ) : schedules.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="pt-6 text-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No schedules created yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schedules.map((s) => (
            <Card key={s.id} className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{s.name}</CardTitle>
                  <Badge variant="outline" className={statusColors[s.status]}>{s.status}</Badge>
                </div>
                <CardDescription>
                  {s.fitness_score != null ? `Fitness: ${s.fitness_score.toFixed(2)}` : 'Not yet generated'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground space-y-1 mb-4">
                  <div>Pop: {s.population_size ?? '—'} · Gen: {s.generation_count ?? '—'} · Mut: {s.mutation_rate ?? '—'}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleGenerate(s)} disabled={generateTimetable.isPending}>
                    <Play className="mr-1 h-3 w-3" />Generate
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingSchedule(s); setFormOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(s.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <ScheduleFormDialog open={formOpen} onOpenChange={setFormOpen} schedule={editingSchedule} />
      <DeleteConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} title="Delete Schedule" isPending={deleteSchedule.isPending} />
    </div>
  );
}
