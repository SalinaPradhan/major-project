import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  DoorOpen,
  GraduationCap,
  Calendar,
  Settings,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const adminLinks = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Departments", url: "/departments", icon: Building2 },
  { title: "Faculty", url: "/faculty", icon: Users },
  { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Rooms", url: "/rooms", icon: DoorOpen },
  { title: "Batches", url: "/batches", icon: GraduationCap },
  { title: "Assignments", url: "/assignments", icon: ClipboardList },
  { title: "Schedules", url: "/schedules", icon: Calendar },
];

const facultyLinks = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Schedule", url: "/schedules", icon: Calendar },
  { title: "Preferences", url: "/preferences", icon: Settings },
];

const studentLinks = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Timetable", url: "/schedules", icon: Calendar },
];

function AppSidebar() {
  const { role, profile, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const links =
    role === "admin" ? adminLinks : role === "faculty" ? facultyLinks : studentLinks;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && "UniScheduler"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        {!collapsed && (
          <p className="text-xs text-sidebar-foreground/60 mb-2 truncate">
            {profile?.display_name}
          </p>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && "Sign Out"}
        </Button>
      </div>
    </Sidebar>
  );
}

export function MainLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
