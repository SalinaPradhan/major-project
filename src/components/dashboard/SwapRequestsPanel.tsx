import { ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SwapRequestsPanel() {
  // Self-contained: will fetch from swap_requests table when available
  return (
    <Card className="glass-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Swap Requests</CardTitle>
        <CardDescription>Faculty schedule change requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6 text-muted-foreground">
          <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No swap requests</p>
          <p className="text-xs mt-1">Schedule swap requests from faculty will appear here.</p>
        </div>
      </CardContent>
    </Card>
  );
}
