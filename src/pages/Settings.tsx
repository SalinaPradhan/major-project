import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Bell, Palette, Globe } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>
      <div className="grid gap-6 max-w-2xl">
        <Card className="glass-card">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4" /> Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label htmlFor="email-notif">Email notifications</Label><Switch id="email-notif" /></div>
            <div className="flex items-center justify-between"><Label htmlFor="conflict-alerts">Conflict alerts</Label><Switch id="conflict-alerts" defaultChecked /></div>
            <div className="flex items-center justify-between"><Label htmlFor="swap-notif">Swap request notifications</Label><Switch id="swap-notif" defaultChecked /></div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Palette className="h-4 w-4" /> Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label htmlFor="dark-mode">Dark mode</Label><Switch id="dark-mode" defaultChecked /></div>
            <div className="flex items-center justify-between"><Label htmlFor="compact">Compact view</Label><Switch id="compact" /></div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Globe className="h-4 w-4" /> General</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Additional settings coming soon.</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
