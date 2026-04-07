import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Plus, Inbox, Send } from 'lucide-react';
import { useSwapRequests, useIncomingSwapRequests, useUpdateSwapRequestStatus } from '@/hooks/useSwapRequests';
import { SwapRequestFormDialog } from './SwapRequestFormDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FAEEDA', text: '#633806' },
  approved: { bg: '#EAF3DE', text: '#27500A' },
  rejected: { bg: '#FCEBEB', text: '#791F1F' },
};

interface Props {
  facultyId: string | null;
  requesterName: string;
}

type Tab = 'outgoing' | 'incoming';

export function FacultySwapPanel({ facultyId, requesterName }: Props) {
  const [tab, setTab] = useState<Tab>('outgoing');
  const { data: outgoing = [], isLoading: outLoading } = useSwapRequests(facultyId);
  const { data: incoming = [], isLoading: inLoading } = useIncomingSwapRequests(facultyId);
  const updateStatus = useUpdateSwapRequestStatus();
  const [formOpen, setFormOpen] = useState(false);

  const swaps = tab === 'outgoing' ? outgoing : incoming;
  const isLoading = tab === 'outgoing' ? outLoading : inLoading;

  const handleAction = async (id: string, status: 'approved' | 'rejected', swap?: any) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: async () => {
          toast.success(`Swap request ${status}`);
          // Create system alert on approval
          if (status === 'approved' && swap) {
            await supabase.from('system_alerts').insert({
              title: 'Swap Request Approved',
              message: `Swap approved: ${swap.requesterName}'s ${swap.fromDay} ${swap.fromSlot} ↔ ${swap.toDay} ${swap.toSlot}`,
              alert_type: 'general',
            });
          }
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-primary" />
            Swap Requests
          </CardTitle>
          {/* Tabs */}
          <div className="flex gap-1 mt-2">
            <Button
              variant={tab === 'outgoing' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-[11px] gap-1 px-2.5"
              onClick={() => setTab('outgoing')}
            >
              <Send className="h-3 w-3" /> Outgoing
              {outgoing.filter((s) => s.status === 'pending').length > 0 && (
                <span className="ml-1 bg-primary/20 text-primary rounded-full px-1.5 text-[10px]">
                  {outgoing.filter((s) => s.status === 'pending').length}
                </span>
              )}
            </Button>
            <Button
              variant={tab === 'incoming' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-[11px] gap-1 px-2.5"
              onClick={() => setTab('incoming')}
            >
              <Inbox className="h-3 w-3" /> Incoming
              {incoming.filter((s) => s.status === 'pending').length > 0 && (
                <span className="ml-1 bg-destructive/20 text-destructive rounded-full px-1.5 text-[10px]">
                  {incoming.filter((s) => s.status === 'pending').length}
                </span>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : swaps.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {tab === 'outgoing' ? 'No outgoing swap requests.' : 'No incoming swap requests.'}
            </p>
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
                    {tab === 'incoming' && (
                      <p className="text-[11px] text-primary mt-0.5">From: {swap.requesterName}</p>
                    )}
                    {tab === 'outgoing' && swap.targetFacultyName && (
                      <p className="text-[11px] text-primary mt-0.5">To: {swap.targetFacultyName}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{swap.reason}</p>

                    {/* Actions */}
                    {swap.status === 'pending' && tab === 'outgoing' && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2"
                          onClick={() => handleAction(swap.id, 'rejected')}
                          disabled={updateStatus.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    {swap.status === 'pending' && tab === 'incoming' && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          className="h-6 text-[11px] px-2"
                          onClick={() => handleAction(swap.id, 'approved', swap)}
                          disabled={updateStatus.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2"
                          onClick={() => handleAction(swap.id, 'rejected')}
                          disabled={updateStatus.isPending}
                        >
                          Reject
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

          {tab === 'outgoing' && (
            <Button
              variant="outline"
              className="w-full mt-3 gap-1.5 text-sm"
              onClick={() => setFormOpen(true)}
              disabled={!facultyId}
            >
              <Plus className="h-3.5 w-3.5" />
              New swap request
            </Button>
          )}
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
