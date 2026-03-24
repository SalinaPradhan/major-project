import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, AppRole } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Departments from "./pages/Departments";
import Faculty from "./pages/Faculty";
import Courses from "./pages/Courses";
import Rooms from "./pages/Rooms";
import Batches from "./pages/Batches";
import Assignments from "./pages/Assignments";
import Generate from "./pages/Generate";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: AppRole[] }) => {
  const { session, role, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground text-sm">Loading...</div>;
  if (!session) return <Navigate to="/auth" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to their own dashboard
    const dashboardMap: Record<string, string> = { admin: "/admin", faculty: "/faculty", student: "/student" };
    return <Navigate to={dashboardMap[role] || "/auth"} replace />;
  }
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, role, loading } = useAuth();
  if (loading) return null;
  if (session && role) {
    const dashboardMap: Record<string, string> = { admin: "/admin", faculty: "/faculty", student: "/student" };
    return <Navigate to={dashboardMap[role] || "/admin"} replace />;
  }
  return <>{children}</>;
};

const RootRedirect = () => {
  const { role, loading } = useAuth();
  if (loading) return null;
  const dashboardMap: Record<string, string> = { admin: "/admin", faculty: "/faculty", student: "/student" };
  return <Navigate to={dashboardMap[role ?? ""] || "/admin"} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<RootRedirect />} />
              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/departments" element={<ProtectedRoute allowedRoles={["admin"]}><Departments /></ProtectedRoute>} />
              <Route path="/faculty" element={<ProtectedRoute allowedRoles={["admin"]}><Faculty /></ProtectedRoute>} />
              <Route path="/courses" element={<ProtectedRoute allowedRoles={["admin"]}><Courses /></ProtectedRoute>} />
              <Route path="/rooms" element={<ProtectedRoute allowedRoles={["admin"]}><Rooms /></ProtectedRoute>} />
              <Route path="/batches" element={<ProtectedRoute allowedRoles={["admin"]}><Batches /></ProtectedRoute>} />
              <Route path="/assignments" element={<ProtectedRoute allowedRoles={["admin"]}><Assignments /></ProtectedRoute>} />
              <Route path="/generate" element={<ProtectedRoute allowedRoles={["admin"]}><Generate /></ProtectedRoute>} />
              {/* Faculty routes */}
              <Route path="/faculty-dashboard" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyDashboard /></ProtectedRoute>} />
              {/* Student routes */}
              <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
              {/* Shared */}
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
