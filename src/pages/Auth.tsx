import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-6">
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

          <TabsContent value="login" className="space-y-4 mt-4">
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@university.edu" /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && handleLogin()} /></div>
            <Button className="w-full" onClick={handleLogin} disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
            <button onClick={handleForgot} className="text-xs text-primary hover:underline w-full text-center block">Forgot password?</button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            <div><Label>Display Name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Dr. John Smith" /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@university.edu" /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" /></div>
            <Button className="w-full" onClick={handleSignup} disabled={loading}>{loading ? "Creating..." : "Create Account"}</Button>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground text-center mt-4">First user gets admin role automatically</p>
      </Card>
    </div>
  );
};

export default Auth;
