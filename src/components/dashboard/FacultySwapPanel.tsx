import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Plus } from 'lucide-react';
import { useSwapRequests, useUpdateSwapRequestStatus } from '@/hooks/useSwapRequests';
import { SwapRequestFormDialog } from './SwapRequestFormDialog';
import { toast } from 'sonner';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FAEEDA', text: '#633806' },
  approved: { bg: '#EAF3DE', text: '#27500A' },
  rejected: { bg: '#FCEBEB', text: '#791F1F' },
};

interface Props {
  facultyId: string | null;
  requesterName: string;
}

export function FacultySwapPanel({ facultyId, requesterName }: Props) {
  const { data: swaps = [], isLoading } = useSwapRequests(facultyId);
  const updateStatus = useUpdateSwapRequestStatus();
  const [formOpen, setFormOpen] = useState(false);

  const handleCancel = (id: string) => {
    updateStatus.mutate(
      { id, status: 'rejected' },
      {
        onSuccess: () => toast.success('Swap request cancelled'),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-primary" />
            Swap Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : swaps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No swap requests yet.</p>
          ) : (
            swaps.map((swap) => {
              const style = STATUS_STYLES[swap.status] || STATUS_STYLES.pending;
              return (
                <div
                  key={swap.id}
                  className="flex items-start justify-between py-3 px-3 border-b border-border/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize">
                      {swap.fromDay} {swap.fromSlot} → {swap.toDay} {swap.toSlot}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{swap.reason}</p>
                    {swap.status === 'pending' && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2"
                          onClick={() => handleCancel(swap.id)}
                          disabled={updateStatus.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 capitalize"
                    style={{ background: style.bg, color: style.text }}
                  >
                    {swap.status}
                  </span>
                </div>
              );
            })
          )}

          <Button
            variant="outline"
            className="w-full mt-3 gap-1.5 text-sm"
            onClick={() => setFormOpen(true)}
            disabled={!facultyId}
          >
            <Plus className="h-3.5 w-3.5" />
            New swap request
          </Button>
        </CardContent>
      </Card>

      {facultyId && (
        <SwapRequestFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          facultyId={facultyId}
          requesterName={requesterName}
        />
      )}
    </>
  );
}
