import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Clock, Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SecurityTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [errors, setErrors] = useState<{ new?: string; confirm?: string }>({});

  const validate = () => {
    const e: { new?: string; confirm?: string } = {};
    if (newPw.length < 8) e.new = "Password must be at least 8 characters";
    if (newPw !== confirmPw) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // NOTE: Password change via backend not yet implemented. Show info toast.
    toast.info(
      "Password change functionality will be available in the next update.",
    );
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock size={15} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Change Password
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-password" className="text-sm">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                className="pr-10"
                data-ocid="security.current_password.input"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-sm">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 8 characters"
                className="pr-10"
                data-ocid="security.new_password.input"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.new && (
              <p
                className="text-xs text-destructive flex items-center gap-1"
                data-ocid="security.new_password.field_error"
              >
                <AlertTriangle size={11} />
                {errors.new}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-sm">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Re-enter new password"
                className="pr-10"
                data-ocid="security.confirm_password.input"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirm && (
              <p
                className="text-xs text-destructive flex items-center gap-1"
                data-ocid="security.confirm_password.field_error"
              >
                <AlertTriangle size={11} />
                {errors.confirm}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto"
            data-ocid="security.change_password.submit_button"
          >
            <Lock size={14} className="mr-2" />
            Update Password
          </Button>
        </form>
      </div>

      {/* Auto-logout info */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Auto Logout</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Your session will automatically expire after{" "}
          <span className="font-medium text-foreground">30 minutes</span> of
          inactivity. This protects your financial data from unauthorized
          access.
        </p>
      </div>

      {/* Security note */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Shield size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Security Tips</p>
            <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground list-disc list-inside">
              <li>Use a strong, unique password with mixed characters</li>
              <li>Never share your login credentials with others</li>
              <li>Always log out on shared devices</li>
              <li>Report suspicious activity to your administrator</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
