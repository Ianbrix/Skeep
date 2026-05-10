import { Role, createActor } from "@/backend";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuthStore } from "@/store/authStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { Link, useRouter } from "@tanstack/react-router";
import { BarChart3, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>(Role.treasurer);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login } = useAuthStore();
  const { actor } = useActor(createActor);
  const router = useRouter();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required.";
    if (!email.trim()) errs.email = "Email is required.";
    if (password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    if (password !== confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!actor) {
      toast.error("System is initializing. Please wait.");
      return;
    }
    setIsLoading(true);
    try {
      const passwordHash = hashPassword(password);
      const result = await actor.createUser(email, passwordHash, name, role);
      if (result.__kind__ === "ok") {
        // Auto-login after registration
        const loginResult = await actor.login(email, passwordHash);
        if (loginResult.__kind__ === "ok") {
          login(loginResult.ok.user, loginResult.ok.token);
          toast.success("Account created successfully! Welcome to SKeep.");
          router.navigate({ to: "/dashboard" });
        } else {
          toast.success("Account created. Please sign in.");
          router.navigate({ to: "/login" });
        }
      } else {
        toast.error(result.err ?? "Registration failed. Please try again.");
      }
    } catch (_err) {
      toast.error("Registration failed. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
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
            <CardTitle className="font-display text-2xl">
              Create Account
            </CardTitle>
            <CardDescription>
              Register as an authorized SK official
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan dela Cruz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9"
                    autoComplete="name"
                    data-ocid="register.name.input"
                  />
                </div>
                {errors.name && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="register.name.field_error"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email Address</Label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="treasurer@sk.gov.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    autoComplete="email"
                    data-ocid="register.email.input"
                  />
                </div>
                {errors.email && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="register.email.field_error"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    autoComplete="new-password"
                    data-ocid="register.password.input"
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
                {errors.password && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="register.password.field_error"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                    autoComplete="new-password"
                    data-ocid="register.confirm_password.input"
                  />
                </div>
                {errors.confirmPassword && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="register.confirm_password.field_error"
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Role selection */}
              <div className="space-y-3">
                <Label>Official Role</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(v) => setRole(v as Role)}
                  className="grid grid-cols-2 gap-3"
                  data-ocid="register.role.radio"
                >
                  <Label
                    htmlFor="role-treasurer"
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-3 text-center transition-smooth ${
                      role === Role.treasurer
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <RadioGroupItem
                      value={Role.treasurer}
                      id="role-treasurer"
                      className="sr-only"
                    />
                    <div className="text-sm font-semibold">SK Treasurer</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Full financial access
                    </div>
                  </Label>
                  <Label
                    htmlFor="role-chairperson"
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-3 text-center transition-smooth ${
                      role === Role.chairperson
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <RadioGroupItem
                      value={Role.chairperson}
                      id="role-chairperson"
                      className="sr-only"
                    />
                    <div className="text-sm font-semibold">SK Chairperson</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      View & approve access
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-ocid="register.submit_button"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
                data-ocid="register.login.link"
              >
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          <Link
            to="/settings/about"
            className="hover:underline"
            data-ocid="register.about.link"
          >
            About SKeep
          </Link>
          {" · "}
          <span>v1.0.0</span>
        </p>
      </div>
    </div>
  );
}
