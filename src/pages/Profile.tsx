import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      setProfile(data);
      setDisplayName(data?.display_name ?? user.email?.split('@')[0] ?? '');
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('user_id', user.id);
      if (error) throw error;
      toast.success('Profile updated');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <User className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16"><AvatarFallback className="bg-primary/20 text-primary text-xl">{initials}</AvatarFallback></Avatar>
            <div>
              <CardTitle>{displayName || 'User'}</CardTitle>
              <div className="flex items-center gap-2 mt-1"><Mail className="h-3 w-3 text-muted-foreground" /><span className="text-sm text-muted-foreground">{user?.email}</span></div>
              <div className="flex items-center gap-2 mt-1"><Shield className="h-3 w-3 text-muted-foreground" /><Badge variant="outline" className="capitalize">{role || 'viewer'}</Badge></div>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2"><Label>Display Name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={user?.email ?? ''} disabled /></div>
          {profile?.student_id && <div className="space-y-2"><Label>Student ID</Label><Input value={profile.student_id} disabled /></div>}
          {profile?.faculty_code && <div className="space-y-2"><Label>Faculty Code</Label><Input value={profile.faculty_code} disabled /></div>}
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
