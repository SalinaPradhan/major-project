import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Monitor, Projector, Laptop } from 'lucide-react';

export default function Assets() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Assets</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projectors</CardTitle>
            <Projector className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">—</div><p className="text-xs text-muted-foreground mt-1">Equipment tracking coming soon</p></CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Computers</CardTitle>
            <Monitor className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">—</div><p className="text-xs text-muted-foreground mt-1">Lab equipment inventory</p></CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Laptops</CardTitle>
            <Laptop className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">—</div><p className="text-xs text-muted-foreground mt-1">Portable device tracking</p></CardContent>
        </Card>
      </div>
      <Card className="glass-card">
        <CardContent className="pt-6"><p className="text-muted-foreground text-center py-8">Asset management module is under development.</p></CardContent>
      </Card>
    </div>
  );
}
