import type { NotificationPublic } from "@/backend";
import { NotificationType } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  FileX,
  Star,
  X,
} from "lucide-react";

// ─── Type config ─────────────────────────────────────────────────────────────
type NotifConfig = {
  icon: React.ElementType;
  iconClass: string;
  badgeClass: string;
  label: string;
};

const NOTIF_CONFIG: Record<NotificationType, NotifConfig> = {
  [NotificationType.budgetAlert]: {
    icon: AlertTriangle,
    iconClass: "text-destructive bg-destructive/10",
    badgeClass: "border-destructive/30 text-destructive bg-destructive/10",
    label: "Budget Alert",
  },
  [NotificationType.coaDeadline]: {
    icon: Clock,
    iconClass: "text-yellow-600 bg-yellow-100",
    badgeClass: "border-yellow-400/40 text-yellow-700 bg-yellow-50",
    label: "COA Deadline",
  },
  [NotificationType.missingReceipt]: {
    icon: FileX,
    iconClass: "text-orange-600 bg-orange-100",
    badgeClass: "border-orange-400/40 text-orange-700 bg-orange-50",
    label: "Missing Receipt",
  },
  [NotificationType.pendingApproval]: {
    icon: CheckCircle,
    iconClass: "text-primary bg-primary/10",
    badgeClass: "border-primary/30 text-primary bg-primary/10",
    label: "Pending Approval",
  },
  [NotificationType.subscriptionReminder]: {
    icon: Star,
    iconClass: "text-purple-600 bg-purple-100",
    badgeClass: "border-purple-400/40 text-purple-700 bg-purple-50",
    label: "Subscription",
  },
};

// ─── Relative time helper ────────────────────────────────────────────────────
function relativeTime(ts: bigint): string {
  const diffMs = Date.now() - Number(ts / 1_000_000n);
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth} month${diffMonth === 1 ? "" : "s"} ago`;
}

// ─── Component ───────────────────────────────────────────────────────────────
interface NotificationItemProps {
  notification: NotificationPublic;
  index: number;
  onMarkRead: (id: bigint) => void;
  onDismiss: (id: bigint) => void;
  isMarkingRead?: boolean;
  isDismissing?: boolean;
}

export function NotificationItem({
  notification,
  index,
  onMarkRead,
  onDismiss,
  isMarkingRead = false,
  isDismissing = false,
}: NotificationItemProps) {
  const config = NOTIF_CONFIG[notification.notifType] ?? {
    icon: Bell,
    iconClass: "text-muted-foreground bg-muted",
    badgeClass: "border-border text-muted-foreground bg-muted",
    label: "Notification",
  };
  const Icon = config.icon;

  return (
    <div
      data-ocid={`notifications.item.${index}`}
      className={cn(
        "group flex gap-4 rounded-lg border border-border p-4 transition-colors duration-200",
        !notification.isRead
          ? "bg-primary/5 border-primary/20 hover:bg-primary/8"
          : "bg-card hover:bg-muted/40",
      )}
      aria-label={notification.title}
    >
      {/* Icon */}
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          config.iconClass,
        )}
      >
        <Icon size={16} aria-hidden />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start gap-2">
          <span
            className={cn(
              "flex-1 text-sm leading-snug",
              !notification.isRead
                ? "font-semibold text-foreground"
                : "font-medium text-foreground/80",
            )}
          >
            {notification.title}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-medium px-1.5 py-0",
                config.badgeClass,
              )}
            >
              {config.label}
            </Badge>
            {!notification.isRead && (
              <span
                className="inline-block h-2 w-2 rounded-full bg-primary"
                aria-label="Unread"
              />
            )}
          </div>
        </div>

        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {relativeTime(notification.createdAt)}
          </span>

          <div className="ml-auto flex items-center gap-1">
            {!notification.isRead && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => onMarkRead(notification.id)}
                disabled={isMarkingRead}
                data-ocid={`notifications.mark_read.${index}`}
                aria-label="Mark as read"
              >
                {isMarkingRead ? "Marking…" : "Mark as read"}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDismiss(notification.id)}
              disabled={isDismissing}
              data-ocid={`notifications.dismiss.${index}`}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
