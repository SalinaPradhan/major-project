import { ArrowRightLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface SwapRequest {
  id: string;
  courseName: string;
  fromSlot: string;
  toSlot: string;
  requestorName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  approved: 'bg-success/20 text-success border-success/30',
  rejected: 'bg-destructive/20 text-destructive border-destructive/30',
};

interface SwapRequestsPanelProps {
  requests: SwapRequest[];
  isAdmin?: boolean;
  isLoading?: boolean;
}

export function SwapRequestsPanel({
  requests,
  isAdmin = false,
  isLoading = false,
}: SwapRequestsPanelProps) {
  if (isLoading) {
    return (
      <Card className="glass-card border-border">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Swap Requests</CardTitle>
          {requests.filter(r => r.status === 'pending').length > 0 && (
            <Badge className="bg-warning/20 text-warning border-warning/30">
              {requests.filter(r => r.status === 'pending').length} pending
            </Badge>
          )}
        </div>
        <CardDescription>
          {isAdmin ? "Review faculty schedule swap requests" : "Your schedule change requests"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No swap requests</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="p-3 rounded-lg border border-border bg-secondary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{req.courseName}</span>
                    <Badge variant="outline" className={cn("text-[10px]", STATUS_STYLES[req.status])}>
                      {req.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>{req.fromSlot} → {req.toSlot}</p>
                    <p>By: {req.requestorName}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
