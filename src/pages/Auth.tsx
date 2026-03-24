import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar, Shield, Users, GraduationCap } from "lucide-react";

type SignupRole = "admin" | "faculty" | "student";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupRole, setSignupRole] = useState<SignupRole>("student");

  // Faculty-specific
  const [facultyCode, setFacultyCode] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  // Student-specific
  const [studentId, setStudentId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [batches, setBatches] = useState<{ id: string; name: string; section: string }[]>([]);

  useEffect(() => {
    supabase.from("departments").select("id, name").order("name").then(({ data }) => {
      if (data) setDepartments(data);
    });
    supabase.from("batches").select("id, name, section").order("name").then(({ data }) => {
      if (data) setBatches(data);
    });
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!displayName.trim()) { toast.error("Please enter your name"); return; }
    if (signupRole === "faculty" && !departmentId) { toast.error("Please select a department"); return; }
    if (signupRole === "student" && !batchId) { toast.error("Please select a batch"); return; }

    setLoading(true);
    const metadata: Record<string, string> = {
      display_name: displayName,
      role: signupRole,
    };
    if (signupRole === "faculty") {
      metadata.faculty_code = facultyCode;
      metadata.department_id = departmentId;
    }
    if (signupRole === "student") {
      metadata.student_id = studentId;
      metadata.batch_id = batchId;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) toast.error(error.message);
    else toast.success("Account created! Check your email to verify.");
    setLoading(false);
  };

  const handleForgot = async () => {
    if (!email) { toast.error("Enter your email first"); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent to your email");
    setLoading(false);
  };

  const roleIcons = { admin: Shield, faculty: Users, student: GraduationCap };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar size={24} className="text-primary" />
            <h1 className="text-lg font-bold text-foreground">URS</h1>
          </div>
          <p className="text-xs text-muted-foreground">University Resource Scheduling System</p>
        </div>

        <Tabs defaultValue="login">
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login" className="space-y-4 mt-4">
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@university.edu" /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && handleLogin()} /></div>
            <Button className="w-full" onClick={handleLogin} disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
            <button onClick={handleForgot} className="text-xs text-primary hover:underline w-full text-center block">Forgot password?</button>
          </TabsContent>

          {/* SIGNUP */}
          <TabsContent value="signup" className="space-y-4 mt-4">
            {/* Role selector */}
            <div>
              <Label className="mb-2 block">I am a...</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["admin", "faculty", "student"] as SignupRole[]).map((r) => {
                  const Icon = roleIcons[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSignupRole(r)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors text-sm font-medium capitalize ${
                        signupRole === r
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <Icon size={20} />
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            <div><Label>Full Name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Dr. John Smith" /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@university.edu" /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" /></div>

            {/* Faculty fields */}
            {signupRole === "faculty" && (
              <>
                <div>
                  <Label>Department</Label>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Faculty Code (optional)</Label><Input value={facultyCode} onChange={(e) => setFacultyCode(e.target.value)} placeholder="e.g. FAC-001" /></div>
              </>
            )}

            {/* Student fields */}
            {signupRole === "student" && (
              <>
                <div>
                  <Label>Batch</Label>
                  <Select value={batchId} onValueChange={setBatchId}>
                    <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                    <SelectContent>
                      {batches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name} - Section {b.section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Student ID</Label><Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. STU-2024-001" /></div>
              </>
            )}

            <Button className="w-full" onClick={handleSignup} disabled={loading}>
              {loading ? "Creating..." : `Create ${signupRole.charAt(0).toUpperCase() + signupRole.slice(1)} Account`}
            </Button>

            {signupRole === "admin" && (
              <p className="text-xs text-muted-foreground text-center">First admin account is auto-approved. Others require approval.</p>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
