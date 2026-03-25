import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AlertsPanel() {
  // Self-contained: in a full implementation would fetch from an alerts table
  return (
    <Card className="glass-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">System Alerts</CardTitle>
          <span className="text-xs text-muted-foreground">0 active</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6 text-muted-foreground">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No alerts at this time</p>
          <p className="text-xs mt-1">Conflict warnings and system notifications will appear here.</p>
        </div>
      </CardContent>
    </Card>
  );
}
