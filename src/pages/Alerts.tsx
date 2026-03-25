import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { Bell } from 'lucide-react';

export default function Alerts() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Alerts & Notifications</h1>
      </div>
      <AlertsPanel />
    </div>
  );
}
