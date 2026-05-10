import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  FileWarning,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NOTIFICATION_TYPES = [
  {
    id: "budgetAlerts",
    label: "Budget Alerts",
    description: "Get notified when spending exceeds budget limits",
    icon: AlertTriangle,
    iconClass: "text-destructive",
    default: true,
  },
  {
    id: "coaDeadlines",
    label: "COA Deadlines",
    description: "Reminders for upcoming COA report submission deadlines",
    icon: CalendarCheck,
    iconClass: "text-primary",
    default: true,
  },
  {
    id: "missingReceipts",
    label: "Missing Receipts",
    description: "Alerts for transactions without attached receipts",
    icon: FileWarning,
    iconClass: "text-accent-foreground",
    default: true,
  },
  {
    id: "pendingApprovals",
    label: "Pending Approvals",
    description: "Notifications for liquidation reports awaiting approval",
    icon: CheckCircle2,
    iconClass: "text-primary",
    default: true,
  },
  {
    id: "subscriptionReminders",
    label: "Subscription Reminders",
    description: "Alerts before your subscription expires",
    icon: CreditCard,
    iconClass: "text-muted-foreground",
    default: true,
  },
];

export function NotificationsTab() {
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_TYPES.map((n) => [n.id, n.default])),
  );

  const handleToggle = (id: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
    const item = NOTIFICATION_TYPES.find((n) => n.id === id);
    toast.success(
      `${item?.label} notifications ${value ? "enabled" : "disabled"}`,
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={15} className="text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Notification Preferences
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-5">
        Choose which notifications you want to receive. You can change these
        preferences at any time.
      </p>

      <div className="divide-y divide-border">
        {NOTIFICATION_TYPES.map((notif) => {
          const Icon = notif.icon;
          return (
            <div
              key={notif.id}
              className="flex items-center justify-between py-4 gap-4"
              data-ocid={`notifications.${notif.id}.toggle`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 flex-shrink-0">
                  <Icon size={16} className={notif.iconClass} />
                </div>
                <div className="min-w-0">
                  <Label
                    htmlFor={`toggle-${notif.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {notif.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {notif.description}
                  </p>
                </div>
              </div>
              <Switch
                id={`toggle-${notif.id}`}
                checked={settings[notif.id] ?? true}
                onCheckedChange={(v) => handleToggle(notif.id, v)}
                data-ocid={`notifications.${notif.id}.switch`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
