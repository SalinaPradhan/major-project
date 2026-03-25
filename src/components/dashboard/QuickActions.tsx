import { Plus, Play, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="glass-card rounded-xl border border-border p-5">
      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2 bg-secondary/30 border-border hover:border-primary/50 hover:bg-primary/10">
          <Play className="h-5 w-5 text-primary" />
          <span className="text-xs">Generate Schedule</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2 bg-secondary/30 border-border hover:border-accent/50 hover:bg-accent/10">
          <Plus className="h-5 w-5 text-accent" />
          <span className="text-xs">Add Resource</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2 bg-secondary/30 border-border hover:border-warning/50 hover:bg-warning/10">
          <RefreshCw className="h-5 w-5 text-warning" />
          <span className="text-xs">Refresh Data</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2 bg-secondary/30 border-border hover:border-info/50 hover:bg-info/10">
          <Download className="h-5 w-5 text-info" />
          <span className="text-xs">Export Report</span>
        </Button>
      </div>
    </div>
  );
}
