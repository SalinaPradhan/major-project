import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Loader2, Mail, Lock, User, ArrowLeft, GraduationCap, Users, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type SignupRole = 'student' | 'faculty' | 'admin';

const STUDENT_EMAIL_PATTERN = /\.\d{4}[@.]/;

export default function Auth() {
  const { user, role, loading, signIn } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [configuringRole, setConfiguringRole] = useState<SignupRole | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<SignupRole>('student');

  if (user && !loading) {
    if (role === 'student') {
      return <Navigate to="/student-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    try { emailSchema.parse(loginEmail); } catch (e) {
      if (e instanceof z.ZodError) newErrors.loginEmail = e.errors[0].message;
    }
    try { passwordSchema.parse(loginPassword); } catch (e) {
      if (e instanceof z.ZodError) newErrors.loginPassword = e.errors[0].message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};
    try { nameSchema.parse(signupName); } catch (e) {
      if (e instanceof z.ZodError) newErrors.signupName = e.errors[0].message;
    }
    try { emailSchema.parse(signupEmail); } catch (e) {
      if (e instanceof z.ZodError) newErrors.signupEmail = e.errors[0].message;
    }
    try { passwordSchema.parse(signupPassword); } catch (e) {
      if (e instanceof z.ZodError) newErrors.signupPassword = e.errors[0].message;
    }
    if (signupPassword !== signupConfirmPassword) {
      newErrors.signupConfirmPassword = 'Passwords do not match';
    }
    if ((selectedRole === 'admin' || selectedRole === 'faculty') && STUDENT_EMAIL_PATTERN.test(signupEmail)) {
      newErrors.signupEmail = 'Staff roles require a non-student institutional email.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setIsSubmitting(true);
    await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setIsSubmitting(true);
    setConfiguringRole(selectedRole);

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: signupName,
          display_name: signupName,
          role: selectedRole,
        },
      },
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Sign up failed', description: error.message });
      setIsSubmitting(false);
      setConfiguringRole(null);
      return;
    }

    toast({ title: 'Account created!', description: 'Signing you in...' });
    const { error: signInError } = await signIn(signupEmail, signupPassword);
    if (signInError) {
      toast({ title: 'Account created', description: 'Please sign in with your credentials.' });
    }
    setIsSubmitting(false);
    setConfiguringRole(null);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    try { emailSchema.parse(forgotEmail); } catch (err) {
      if (err instanceof z.ZodError) newErrors.forgotEmail = err.errors[0].message;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Failed to send reset email', description: error.message });
    } else {
      setResetEmailSent(true);
      toast({ title: 'Reset email sent!', description: 'Check your inbox for a password reset link.' });
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const roleOptions: { value: SignupRole; label: string; icon: React.ElementType; description: string }[] = [
    { value: 'student', label: 'Student', icon: GraduationCap, description: 'View schedules & events' },
    { value: 'faculty', label: 'Faculty', icon: Users, description: 'Manage classes & bookings' },
    { value: 'admin', label: 'Admin', icon: Shield, description: 'Full system access' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-10 w-10 text-primary animate-pulse-glow" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">TROS</h1>
          <p className="text-muted-foreground text-sm">Total Resource Optimization System</p>
        </div>

        {configuringRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="text-foreground font-medium">Configuring your {configuringRole} Dashboard...</p>
            </div>
          </div>
        )}

        <Card className="glass-card border-border">
          {showForgotPassword ? (
            <>
              <CardHeader className="text-center">
                <CardTitle>{resetEmailSent ? 'Check Your Email' : 'Reset Password'}</CardTitle>
                <CardDescription>
                  {resetEmailSent
                    ? 'We sent a password reset link to your email address.'
                    : "Enter your email and we'll send you a reset link"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resetEmailSent ? (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">Didn't receive it? Check your spam folder or try again.</p>
                    <Button variant="outline" className="w-full" onClick={() => { setShowForgotPassword(false); setResetEmailSent(false); }}>
                      <ArrowLeft className="mr-2 h-4 w-4" />Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="forgot-email" type="email" placeholder="you@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="pl-10 bg-secondary/50" />
                      </div>
                      {errors.forgotEmail && <p className="text-xs text-destructive">{errors.forgotEmail}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />Back to Sign In
                    </Button>
                  </form>
                )}
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <CardTitle>Welcome</CardTitle>
                <CardDescription>Sign in to access the resource management system</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="pl-10 bg-secondary/50" />
                        </div>
                        {errors.loginEmail && <p className="text-xs text-destructive">{errors.loginEmail}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="login-password" type={showLoginPassword ? 'text' : 'password'} placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="pl-10 pr-10 bg-secondary/50" />
                          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowLoginPassword(!showLoginPassword)} tabIndex={-1}>
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.loginPassword && <p className="text-xs text-destructive">{errors.loginPassword}</p>}
                      </div>
                      <div className="text-right">
                        <button type="button" className="text-xs text-primary hover:underline" onClick={() => { setShowForgotPassword(true); setForgotEmail(loginEmail); }}>
                          Forgot password?
                        </button>
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">I am a...</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {roleOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = selectedRole === opt.value;
                            return (
                              <button type="button" key={opt.value} onClick={() => setSelectedRole(opt.value)}
                                className={cn(
                                  "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center",
                                  isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground hover:border-muted-foreground/50"
                                )}>
                                <Icon className="h-5 w-5" />
                                <span className="text-xs font-medium">{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          {roleOptions.find(r => r.value === selectedRole)?.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="signup-name" placeholder="John Doe" value={signupName} onChange={(e) => setSignupName(e.target.value)} className="pl-10 bg-secondary/50" />
                        </div>
                        {errors.signupName && <p className="text-xs text-destructive">{errors.signupName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="signup-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="pl-10 bg-secondary/50" />
                        </div>
                        {errors.signupEmail && <p className="text-xs text-destructive">{errors.signupEmail}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="pl-10 bg-secondary/50" />
                        </div>
                        {errors.signupPassword && <p className="text-xs text-destructive">{errors.signupPassword}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="signup-confirm" type="password" placeholder="••••••••" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} className="pl-10 bg-secondary/50" />
                        </div>
                        {errors.signupConfirmPassword && <p className="text-xs text-destructive">{errors.signupConfirmPassword}</p>}
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
                      </Button>

                      {selectedRole !== 'student' && (
                        <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
                          <p className="text-xs text-warning">⚠ Staff roles require a non-student institutional email.</p>
                        </div>
                      )}
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
