import { createActor } from "@/backend";
import type {
  AllocationPublic,
  Budget,
  NotificationPublic,
  ProjectPublic,
  TransactionFilter,
  TransactionPublic,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Dashboard Summary ──────────────────────────────────────────────────
export function useDashboardSummary() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Budget ────────────────────────────────────────────────────────────
export function useBudget() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Budget | null>({
    queryKey: ["budget"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBudget();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Transactions ──────────────────────────────────────────────────────
export function useTransactions(filter: TransactionFilter | null = null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TransactionPublic[]>({
    queryKey: ["transactions", filter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Allocations ──────────────────────────────────────────────────────
export function useAllocations() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AllocationPublic[]>({
    queryKey: ["allocations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllocations();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Projects ─────────────────────────────────────────────────────────
export function useProjects() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ProjectPublic[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Notifications ────────────────────────────────────────────────────
export function useNotifications(userId: bigint | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<NotificationPublic[]>({
    queryKey: ["notifications", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getNotifications(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
    refetchInterval: 30_000, // poll every 30 seconds
  });
}

export function useUnreadCount(userId: bigint | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["notifications", "unread", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return 0n;
      return actor.getUnreadCount(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
    refetchInterval: 30_000, // poll every 30 seconds
  });
}

// ─── COA Reports ──────────────────────────────────────────────────────
export function useCoaReports() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["coa", "reports"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCoaReports();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOverdueReports() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["coa", "overdue"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOverdueReports();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Suppliers ────────────────────────────────────────────────────────
export function useSuppliers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSuppliers();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Audit Logs ───────────────────────────────────────────────────────
export function useRecentAuditLogs(limit = 20n) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["audit", "recent", limit.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentLogs(limit);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAuditLogs(
  filter: import("@/backend").AuditFilter | null = null,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: [
      "audit",
      "logs",
      JSON.stringify(filter, (_, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
    ],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAuditLogs(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────
export function useMarkNotificationRead() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.markAsRead(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDismissNotification() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.dismissNotification(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
