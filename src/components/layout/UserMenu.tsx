import { LogOut, User, Settings, Shield, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const { user, role, signOut, isAdmin, isFaculty, isStudent } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const getRoleIcon = () => {
    if (isAdmin) return <Shield className="h-3 w-3" />;
    if (isFaculty) return <Users className="h-3 w-3" />;
    return <GraduationCap className="h-3 w-3" />;
  };

  const getRoleBadgeStyle = () => {
    if (isAdmin) return 'bg-destructive/20 text-destructive border-destructive/30';
    if (isFaculty) return 'bg-primary/20 text-primary border-primary/30';
    return 'bg-accent/20 text-accent border-accent/30';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:flex flex-col items-start text-xs">
            <span className="text-foreground font-medium">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </span>
            <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] capitalize", getRoleBadgeStyle())}>
              {getRoleIcon()}
              {role || 'User'}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user.user_metadata?.full_name || 'User'}</span>
            <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
