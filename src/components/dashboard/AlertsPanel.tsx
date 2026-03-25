import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Alert } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
    }
  };

  const getStyles = (type: Alert['type']) => {
    switch (type) {
      case 'error': return 'border-destructive/30 bg-destructive/10';
      case 'warning': return 'border-warning/30 bg-warning/10';
      case 'info': return 'border-primary/30 bg-primary/10';
    }
  };

  const getIconStyles = (type: Alert['type']) => {
    switch (type) {
      case 'error': return 'text-destructive';
      case 'warning': return 'text-warning';
      case 'info': return 'text-primary';
    }
  };

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div className="glass-card rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">System Alerts</h3>
        <span className="text-xs text-muted-foreground">{unresolvedAlerts.length} active</span>
      </div>

      <div className="space-y-3">
        {unresolvedAlerts.map((alert) => {
          const Icon = getIcon(alert.type);
          return (
            <div key={alert.id} className={cn("flex items-start gap-3 p-3 rounded-lg border", getStyles(alert.type))}>
              <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", getIconStyles(alert.type))} />
              <div>
                <p className="text-sm font-medium text-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      {resolvedAlerts.length > 0 && (
        <>
          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground mb-2">Resolved</p>
            {resolvedAlerts.slice(0, 2).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-2 opacity-60">
                <p className="text-xs text-muted-foreground line-through">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <Button variant="ghost" className="w-full text-sm text-muted-foreground hover:text-foreground">
        View All Alerts
      </Button>
    </div>
  );
}
