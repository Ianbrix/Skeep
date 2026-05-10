import { NotificationType } from "@/backend";
import type { NotificationPublic } from "@/backend";
import { createActor } from "@/backend";
import { AppLayout } from "@/components/layout/AppLayout";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDismissNotification,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useBackend";
import { useAuthStore } from "@/store/authStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle,
  Clock,
  FileX,
  Star,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

// ─── Filter types ─────────────────────────────────────────────────────────────
type FilterTab = "all" | "unread" | NotificationType;

const TYPE_TABS: {
  value: FilterTab;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "all", label: "All", icon: Bell },
  { value: "unread", label: "Unread", icon: Bell },
  { value: NotificationType.budgetAlert, label: "Budget", icon: AlertTriangle },
  { value: NotificationType.coaDeadline, label: "COA", icon: Clock },
  { value: NotificationType.missingReceipt, label: "Receipts", icon: FileX },
  {
    value: NotificationType.pendingApproval,
    label: "Approvals",
    icon: CheckCircle,
  },
  {
    value: NotificationType.subscriptionReminder,
    label: "Subscription",
    icon: Star,
  },
];

// ─── Mark-all-as-read hook ────────────────────────────────────────────────────
function useMarkAllRead(
  userId: bigint | undefined,
  notifications: NotificationPublic[],
) {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const markAll = useCallback(async () => {
    if (!actor || !userId) return;
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;
    setIsPending(true);
    try {
      for (const n of unread) {
        await actor.markAsRead(n.id);
      }
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(
        `${unread.length} notification${unread.length === 1 ? "" : "s"} marked as read`,
      );
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setIsPending(false);
    }
  }, [actor, userId, notifications, qc]);

  return { markAll, isPending };
}

// ─── Skeletons ────────────────────────────────────────────────────────────────
function NotificationSkeleton() {
  return (
    <div className="flex gap-4 rounded-lg border border-border bg-card p-4">
      <Skeleton className="mt-0.5 h-9 w-9 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ filter }: { filter: FilterTab }) {
  const msg =
    filter === "unread"
      ? "All caught up! No unread notifications."
      : filter === "all"
        ? "You have no notifications yet."
        : "No notifications in this category.";
  return (
    <div
      data-ocid="notifications.empty_state"
      className="flex flex-col items-center justify-center gap-3 py-16 text-center"
    >
      <BellOff size={40} className="text-muted-foreground/40" />
      <p className="font-medium text-muted-foreground">{msg}</p>
      <p className="text-sm text-muted-foreground/60">
        You'll see budget alerts, COA deadlines, and more here.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function NotificationsPage() {
  const { user } = useAuthStore();
  const userId = user?.id;

  const { data: notifications = [], isLoading } = useNotifications(userId);
  const markReadMutation = useMarkNotificationRead();
  const dismissMutation = useDismissNotification();
  const { markAll, isPending: isMarkingAll } = useMarkAllRead(
    userId,
    notifications,
  );

  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered: NotificationPublic[] = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    return n.notifType === activeTab;
  });

  const handleMarkRead = (id: bigint) => {
    markReadMutation.mutate(id, {
      onSuccess: () => toast.success("Marked as read"),
      onError: () => toast.error("Failed to mark as read"),
    });
  };

  const handleDismiss = (id: bigint) => {
    dismissMutation.mutate(id, {
      onSuccess: () => toast.success("Notification dismissed"),
      onError: () => toast.error("Failed to dismiss"),
    });
  };

  return (
    <AppLayout unreadCount={unreadCount}>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="text-xs"
                  data-ocid="notifications.unread_count_badge"
                >
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Stay updated on budget alerts, COA deadlines, and pending actions.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
              onClick={markAll}
              disabled={isMarkingAll}
              data-ocid="notifications.mark_all_read_button"
            >
              <CheckCheck size={14} />
              {isMarkingAll ? "Marking…" : "Mark all as read"}
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as FilterTab)}
        >
          <TabsList
            className="flex h-auto w-full flex-wrap gap-1 bg-muted/40 p-1"
            data-ocid="notifications.filter.tab"
          >
            {TYPE_TABS.map(({ value, label, icon: Icon }) => {
              const count =
                value === "all"
                  ? notifications.length
                  : value === "unread"
                    ? notifications.filter((n) => !n.isRead).length
                    : notifications.filter((n) => n.notifType === value).length;

              return (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-ocid={`notifications.tab.${value}`}
                >
                  <Icon size={12} />
                  {label}
                  {count > 0 && (
                    <span className="rounded-full bg-current/20 px-1.5 py-0.5 text-[10px] font-semibold leading-none opacity-80">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Notification list */}
        <div className="space-y-2">
          {isLoading ? (
            <>
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </>
          ) : filtered.length === 0 ? (
            <EmptyState filter={activeTab} />
          ) : (
            filtered.map((notif, idx) => (
              <NotificationItem
                key={notif.id.toString()}
                notification={notif}
                index={idx + 1}
                onMarkRead={handleMarkRead}
                onDismiss={handleDismiss}
                isMarkingRead={
                  markReadMutation.isPending &&
                  markReadMutation.variables === notif.id
                }
                isDismissing={
                  dismissMutation.isPending &&
                  dismissMutation.variables === notif.id
                }
              />
            ))
          )}
        </div>

        {/* Footer summary */}
        {!isLoading && notifications.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            {notifications.length} total notification
            {notifications.length === 1 ? "" : "s"} · {unreadCount} unread
          </p>
        )}
      </div>
    </AppLayout>
  );
}
