import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Inbox } from 'lucide-react';
import { useMyPendingRequests, useReviewVenueRequest } from '@/hooks/useVenueRequests';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export function VenueRequestsPanel() {
  const { user } = useAuth();
  const { data: requests = [], isLoading } = useMyPendingRequests(user?.id);
  const reviewRequest = useReviewVenueRequest();

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await reviewRequest.mutateAsync({ id, status });
      toast.success(`Request ${status}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to review request');
    }
  };

  return (
    <Card className="glass-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Pending Venue Requests</CardTitle>
          <Badge variant="secondary">{requests.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        ) : requests.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pending requests</p>
            <p className="text-xs mt-1">Requests for your venue bookings will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{r.requestor_name}</p>
                    <p className="text-xs text-muted-foreground">
                      For: {r.event_name} @ {r.venue_name}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{r.reason}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                    onClick={() => handleReview(r.id, 'approved')}
                    disabled={reviewRequest.isPending}
                  >
                    <Check className="h-3 w-3 mr-1" />Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => handleReview(r.id, 'rejected')}
                    disabled={reviewRequest.isPending}
                  >
                    <X className="h-3 w-3 mr-1" />Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
