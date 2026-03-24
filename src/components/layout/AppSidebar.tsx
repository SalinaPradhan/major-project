import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  DoorOpen,
  GraduationCap,
  Link2,
  Calendar,
  Cog,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface NavItem {
  to: string;
  icon: any;
  label: string;
  roles: AppRole[];
}

const navItems: NavItem[] = [
  // Admin
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", roles: ["admin"] },
  { to: "/departments", icon: Building2, label: "Departments", roles: ["admin"] },
  { to: "/faculty", icon: Users, label: "Faculty", roles: ["admin"] },
  { to: "/courses", icon: BookOpen, label: "Courses", roles: ["admin"] },
  { to: "/rooms", icon: DoorOpen, label: "Rooms", roles: ["admin"] },
  { to: "/batches", icon: GraduationCap, label: "Batches", roles: ["admin"] },
  { to: "/assignments", icon: Link2, label: "Assignments", roles: ["admin"] },
  { to: "/generate", icon: Calendar, label: "Generate", roles: ["admin"] },
  // Faculty
  { to: "/faculty-dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["faculty"] },
  // Student
  { to: "/student", icon: LayoutDashboard, label: "Dashboard", roles: ["student"] },
  // Shared
  { to: "/settings", icon: Cog, label: "Settings", roles: ["admin", "faculty", "student"] },
];

const roleIcons: Record<string, any> = {
  admin: Shield,
  faculty: Users,
  student: GraduationCap,
};

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, role, signOut } = useAuth();

  const filteredNavItems = navItems.filter((item) => role && item.roles.includes(role));
  const RoleIcon = role ? roleIcons[role] || User : User;

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight text-sidebar-primary-foreground">
            URS
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-0.5 px-2 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="mb-2">
            <div className="flex items-center gap-1.5 mb-1">
              <RoleIcon size={12} className="text-sidebar-primary" />
              <span className="text-xs font-medium text-sidebar-foreground/80 capitalize">{role || "..."}</span>
            </div>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className={cn(
            "w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "px-2"
          )}
        >
          <LogOut size={16} />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;
