import { NavLink, useLocation } from "react-router-dom";
import {
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
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/departments", icon: Building2, label: "Departments" },
  { to: "/faculty", icon: Users, label: "Faculty" },
  { to: "/courses", icon: BookOpen, label: "Courses" },
  { to: "/rooms", icon: DoorOpen, label: "Rooms" },
  { to: "/batches", icon: GraduationCap, label: "Batches" },
  { to: "/assignments", icon: Link2, label: "Assignments" },
  { to: "/generate", icon: Calendar, label: "Generate" },
  { to: "/settings", icon: Cog, label: "Settings" },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

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
      <nav className="flex-1 py-2 space-y-0.5 px-2">
        {navItems.map((item) => {
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

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/40">
            University Resource System
          </p>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
