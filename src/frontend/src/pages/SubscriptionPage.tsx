import { createActor } from "@/backend";
import type { SubscriptionPublic } from "@/backend";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  PhoneCall,
  Star,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PLAN_FEATURES = [
  "Unlimited transaction recording",
  "Advanced COA report generation",
  "Budget management & overspend alerts",
  "Project tracking & liquidation reports",
  "BIR & supplier compliance management",
  "Receipt cloud storage",
  "Audit trail & security logs",
  "Chairperson transparency dashboard",
  "Priority support",
];

function StatusBanner({ sub }: { sub: SubscriptionPublic }) {
  const status = sub.status;

  if (status === "expired") {
    return (
      <div
        className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
        data-ocid="subscription.expired.banner"
      >
        <AlertTriangle
          size={18}
          className="text-destructive mt-0.5 flex-shrink-0"
        />
        <div>
          <p className="text-sm font-semibold text-destructive">
            Subscription Expired
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your subscription has expired. Renew now to regain full access to
            all SKeep features.
          </p>
        </div>
      </div>
    );
  }

  if (status === "trial") {
    const trialStart = sub.trialStartDate
      ? Number(sub.trialStartDate) / 1_000_000
      : Date.now();
    const trialEnd = trialStart + 3 * 24 * 60 * 60 * 1000;
    const daysLeft = Math.max(
      0,
      Math.ceil((trialEnd - Date.now()) / (24 * 60 * 60 * 1000)),
    );
    return (
      <div
        className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4"
        data-ocid="subscription.trial.banner"
      >
        <Clock size={18} className="text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-primary">
            Free Trial Active
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {daysLeft > 0
              ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining. Subscribe to keep full access.`
              : "Your trial ends today. Subscribe now to continue."}
          </p>
        </div>
      </div>
    );
  }

  if (status === "active" && sub.subscriptionEndDate) {
    const endDate = new Date(
      Number(sub.subscriptionEndDate) / 1_000_000,
    ).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return (
      <div
        className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4"
        data-ocid="subscription.active.banner"
      >
        <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Active Subscription
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your subscription is active. Renews on {endDate}.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export function SubscriptionPage() {
  const { user } = useAuthStore();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refNumber, setRefNumber] = useState("");

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", user?.id?.toString()],
    queryFn: async () =>
      actor && user ? actor.getSubscription(user.id) : null,
    enabled: !!actor && !isFetching && !!user,
  });

  const activateMutation = useMutation({
    mutationFn: async (_ref: string) => {
      if (!actor || !user) throw new Error("Not available");
      const endDate =
        BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000) * BigInt(1_000_000);
      const result = await actor.activateSubscription(
        user.id,
        endDate,
        BigInt(9900),
      );
      if (!result) throw new Error("Activation failed");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      setDialogOpen(false);
      setRefNumber("");
      toast.success("Subscription activated successfully!");
    },
    onError: () => {
      toast.error("Failed to activate subscription. Please contact support.");
    },
  });

  const handleActivate = () => {
    if (!refNumber.trim()) {
      toast.error("Please enter your GCash reference number");
      return;
    }
    activateMutation.mutate(refNumber.trim());
  };

  const sub = subscription ?? null;
  const isActive = sub?.status === "active";
  const isExpired = sub?.status === "expired";

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6" data-ocid="subscription.page">
        {/* Page Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Subscription
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your SKeep subscription plan
          </p>
        </div>

        {/* Current Status Card */}
        <Card className="border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="flex items-center gap-2 font-display text-base">
              <Crown size={16} className="text-primary" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {isLoading ? (
              <div
                className="space-y-3"
                data-ocid="subscription.status.loading_state"
              >
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ) : sub ? (
              <>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      sub.status === "active"
                        ? "default"
                        : sub.status === "expired"
                          ? "destructive"
                          : "secondary"
                    }
                    className="capitalize"
                  >
                    {sub.status === "trial"
                      ? "Free Trial"
                      : sub.status === "active"
                        ? "Active"
                        : "Expired"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {sub.planName}
                  </span>
                </div>
                <StatusBanner sub={sub} />
              </>
            ) : (
              <div
                className="text-center py-4"
                data-ocid="subscription.status.empty_state"
              >
                <Crown
                  size={28}
                  className="mx-auto text-muted-foreground mb-2"
                />
                <p className="text-sm font-medium text-foreground">
                  No subscription found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start your 3-day free trial to get full access.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expired upgrade prompt */}
        {isExpired && (
          <div
            className="rounded-lg border-2 border-destructive bg-destructive/5 p-4 flex items-start gap-3"
            data-ocid="subscription.expired.upgrade_prompt"
          >
            <Zap size={18} className="text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-destructive">
                Renew Your Subscription
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Some features are locked. Renew for \u20b199/month to restore
                full access.
              </p>
            </div>
          </div>
        )}

        {/* Pricing Card */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-xl">
                SKeep Premium
              </CardTitle>
              <Badge className="bg-primary text-primary-foreground">
                <Star size={11} className="mr-1" /> Best Value
              </Badge>
            </div>
            <CardDescription>
              Full access to all SK financial management features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-1">
              <span className="font-display text-5xl font-bold text-foreground">
                \u20b199
              </span>
              <span className="text-muted-foreground mb-1.5">/month</span>
            </div>
            <p className="text-xs text-muted-foreground">
              \u2728 3-day free trial included for new users. No upfront payment
              required to start.
            </p>

            <Separator />

            <ul className="space-y-2">
              {PLAN_FEATURES.map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm">
                  <CheckCircle2
                    size={14}
                    className="text-primary flex-shrink-0"
                  />
                  {feat}
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              onClick={() => setDialogOpen(true)}
              data-ocid="subscription.subscribe.button"
            >
              <CreditCard size={15} className="mr-2" />
              {isActive
                ? "Renew Subscription"
                : "Subscribe Now \u2014 \u20b199/month"}
            </Button>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PhoneCall size={15} className="text-primary" />
              Payment Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-lg bg-muted/40 border border-border p-4 space-y-3">
              {[
                {
                  step: "1",
                  title: "Send \u20b199 via GCash",
                  desc: (
                    <>
                      Send to GCash number:{" "}
                      <span className="font-semibold text-foreground">
                        09810754753
                      </span>{" "}
                      (IAN BRIX F. BARCENA)
                    </>
                  ),
                },
                {
                  step: "2",
                  title: "Get your Reference Number",
                  desc: "Save the GCash transaction reference number from the confirmation screen.",
                },
                {
                  step: "3",
                  title: "Activate your subscription",
                  desc: 'Click "Subscribe Now" and enter your reference number to activate.',
                },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Having trouble? Email us at{" "}
              <a
                href="mailto:ianbrixbarcena@gmail.com"
                className="text-primary hover:underline"
              >
                ianbrixbarcena@gmail.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="subscription.activation.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              Activate Subscription
            </DialogTitle>
            <DialogDescription>
              Enter your GCash reference number to activate your SKeep
              subscription.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs text-muted-foreground">
              Send \u20b199 to GCash{" "}
              <strong className="text-foreground">09810754753</strong> (IAN BRIX
              F. BARCENA), then enter the reference number below.
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ref-number" className="text-sm">
                GCash Reference Number
              </Label>
              <Input
                id="ref-number"
                placeholder="e.g. 1234567890"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                data-ocid="subscription.ref_number.input"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setRefNumber("");
              }}
              data-ocid="subscription.activation.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleActivate}
              disabled={activateMutation.isPending || !refNumber.trim()}
              data-ocid="subscription.activation.confirm_button"
            >
              {activateMutation.isPending ? "Activating..." : "Activate Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
