import { createActor } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { Link, useRouter } from "@tanstack/react-router";
import { BarChart3, Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function hashPassword(password: string): string {
  // Simple hash for demo — in production, use a proper crypto hash
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const { actor } = useActor(createActor);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("System is initializing. Please wait.");
      return;
    }
    setIsLoading(true);
    try {
      const passwordHash = hashPassword(password);
      const result = await actor.login(email, passwordHash);
      if (result.__kind__ === "ok") {
        login(result.ok.user, result.ok.token);
        toast.success(`Welcome back, ${result.ok.user.name}!`);
        router.navigate({ to: "/dashboard" });
      } else {
        toast.error(result.err ?? "Invalid credentials. Please try again.");
      }
    } catch (_err) {
      toast.error("Login failed. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-primary p-10 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
            <BarChart3 size={22} className="text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-xl font-bold">SKeep</div>
            <div className="text-xs text-primary-foreground/70">
              SK Financial Management
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl font-bold leading-tight">
              Empowering SK Transparency
            </h2>
            <p className="mt-3 text-primary-foreground/80 text-sm leading-relaxed">
              A digital financial management system for SK Treasurers and
              Chairpersons to simplify transaction recording, budgeting, COA
              compliance, and financial transparency.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: <Shield size={16} />, text: "COA-Compliant Reporting" },
              {
                icon: <BarChart3 size={16} />,
                text: "Real-time Budget Tracking",
              },
              { icon: <Lock size={16} />, text: "Secure Role-Based Access" },
            ].map((feat) => (
              <div
                key={feat.text}
                className="flex items-center gap-2 text-sm text-primary-foreground/90"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20">
                  {feat.icon}
                </span>
                {feat.text}
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} SKeep — For SK Officials
        </div>
      </div>

      {/* Right Panel — form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BarChart3 size={22} className="text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-xl font-bold text-foreground">
                SKeep
              </div>
              <div className="text-xs text-muted-foreground">
                SK Financial Management
              </div>
            </div>
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="font-display text-2xl">Sign In</CardTitle>
              <CardDescription>
                Access your SK financial management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="treasurer@sk.gov.ph"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                      autoComplete="email"
                      data-ocid="login.email.input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10"
                      required
                      autoComplete="current-password"
                      data-ocid="login.password.input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-ocid="login.submit_button"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">
                  Don't have an account?{" "}
                </span>
                <Link
                  to="/register"
                  className="font-medium text-primary hover:underline"
                  data-ocid="login.register.link"
                >
                  Register
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            <Link
              to="/about"
              className="hover:underline"
              data-ocid="login.about.link"
            >
              About SKeep
            </Link>
            {" · "}
            <span>v1.0.0</span>
          </p>
        </div>
      </div>
    </div>
  );
}
