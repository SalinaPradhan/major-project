import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }
  }, []);

  const handleReset = async () => {
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated successfully!");
      navigate("/");
    }
    setLoading(false);
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="p-6 max-w-sm w-full text-center">
          <p className="text-sm text-muted-foreground">Invalid or expired reset link</p>
          <Button variant="link" onClick={() => navigate("/auth")}>Back to login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="p-6 max-w-sm w-full space-y-4">
        <h1 className="text-lg font-bold text-foreground">Reset Password</h1>
        <div><Label>New Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" /></div>
        <Button className="w-full" onClick={handleReset} disabled={loading}>{loading ? "Updating..." : "Update Password"}</Button>
      </Card>
    </div>
  );
};

export default ResetPassword;
