import {
  LayoutDashboard,
  DoorOpen,
  Users,
  UserCog,
  Package,
  BookOpen,
  GraduationCap,
  Calendar,
  Bell,
  Settings,
  Brain,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isAdminOrAbove, isFaculty, isStudent, role } = useAuth();

  const getNavigation = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Timetable', href: '/timetable', icon: Calendar },
    ];

    if (isAdminOrAbove) {
      const items = [
        ...baseItems,
        { name: 'Rooms', href: '/rooms', icon: DoorOpen },
        { name: 'Faculty', href: '/faculty', icon: Users },
        { name: 'Courses', href: '/courses', icon: BookOpen },
        { name: 'Batches', href: '/batches', icon: GraduationCap },
      ];

      items.push(
        { name: 'Support Staff', href: '/staff', icon: UserCog },
        { name: 'Assets', href: '/assets', icon: Package },
      );

      return items;
    }

    if (isFaculty) {
      return [
        ...baseItems,
        { name: 'My Dashboard', href: '/my-dashboard', icon: User },
        { name: 'Rooms', href: '/rooms', icon: DoorOpen },
        { name: 'Courses', href: '/courses', icon: BookOpen },
      ];
    }

    if (isStudent) {
      return [
        ...baseItems,
        { name: 'My Schedule', href: '/student-dashboard', icon: GraduationCap },
      ];
    }

    return baseItems;
  };

  const getSecondaryNavigation = () => {
    const items: { name: string; href: string; icon: typeof Brain }[] = [];

    if (isAdminOrAbove) {
      items.push({ name: 'AI Scheduler', href: '/scheduler', icon: Brain });
    }

    items.push({ name: 'Alerts', href: '/alerts', icon: Bell });

    if (isAdminOrAbove) {
      items.push({ name: 'Settings', href: '/settings', icon: Settings });
    }

    return items;
  };

  const navigation = getNavigation();
  const secondaryNavigation = getSecondaryNavigation();

  const getRoleLabel = () => {
    if (isAdminOrAbove) return 'Admin';
    return role;
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-border">
        <Brain className="h-7 w-7 text-primary shrink-0" />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-lg gradient-text">TROS</span>
            <span className="text-[10px] text-muted-foreground leading-none">Resource Optimization</span>
          </div>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary glow-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}

        {/* Divider */}
        <div className="my-4 border-t border-border" />

        {secondaryNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary glow-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Role badge + collapse toggle */}
      <div className="border-t border-border p-3 flex items-center justify-between">
        {!collapsed && (
          <span className="text-xs text-muted-foreground capitalize">{getRoleLabel()}</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
