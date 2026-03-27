import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight } from 'lucide-react';
import { useSwapRequests } from '@/hooks/useSwapRequests';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export function FacultySwapPanel() {
  const { data: swaps = [], isLoading } = useSwapRequests();

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-primary" />
          Swap Requests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : swaps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No swap requests yet.</p>
        ) : (
          swaps.map((swap) => (
            <div
              key={swap.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {swap.fromDay} {swap.fromSlot} → {swap.toDay} {swap.toSlot}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{swap.reason}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] shrink-0 ml-2 ${STATUS_STYLES[swap.status] || ''}`}>
                {swap.status}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
