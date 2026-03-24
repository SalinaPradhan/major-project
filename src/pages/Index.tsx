import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { role } = useAuth();
  const dashboardMap: Record<string, string> = { admin: "/admin", faculty: "/faculty-dashboard", student: "/student" };
  return <Navigate to={dashboardMap[role ?? ""] || "/admin"} replace />;
};

export default Index;
