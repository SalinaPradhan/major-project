import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users2, Shield } from 'lucide-react';

export default function Staff() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Users2 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-muted-foreground" />User & Role Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Staff and user role management is coming soon.</p>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">Admin</Badge>
            <Badge variant="outline">Faculty</Badge>
            <Badge variant="outline">Student</Badge>
            <Badge variant="outline">Viewer</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
