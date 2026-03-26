import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/MainLayout";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Departments from "./pages/Departments";
import Faculty from "./pages/Faculty";
import Courses from "./pages/Courses";
import Rooms from "./pages/Rooms";
import Batches from "./pages/Batches";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

import Timetable from "./pages/Timetable";
import Staff from "./pages/Staff";
import Assets from "./pages/Assets";
import Scheduler from "./pages/Scheduler";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import VenueManagement from "./pages/VenueManagement";
import TeachingAssignments from "./pages/TeachingAssignments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<ProtectedRoute redirectStudents><Index /></ProtectedRoute>} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/faculty" element={<Faculty />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/batches" element={<Batches />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/teaching-assignments" element={<ProtectedRoute allowedRoles={['admin']}><TeachingAssignments /></ProtectedRoute>} />
              <Route path="/staff" element={<ProtectedRoute allowedRoles={['admin']}><Staff /></ProtectedRoute>} />
              <Route path="/assets" element={<ProtectedRoute allowedRoles={['admin']}><Assets /></ProtectedRoute>} />
              <Route path="/scheduler" element={<ProtectedRoute allowedRoles={['admin']}><Scheduler /></ProtectedRoute>} />
              <Route path="/venue-management" element={<VenueManagement />} />
              <Route path="/event-scheduler" element={<Navigate to="/venue-management" replace />} />
              <Route path="/my-dashboard" element={<ProtectedRoute allowedRoles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
