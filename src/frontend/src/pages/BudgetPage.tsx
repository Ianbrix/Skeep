import { createActor } from "@/backend";
import type { AllocationPublic, Budget } from "@/backend";
import { Role } from "@/backend";
import { AllocationTable } from "@/components/budget/AllocationTable";
import { BudgetForm } from "@/components/budget/BudgetForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  PiggyBank,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

const peso = (n: number | bigint) =>
  `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const _CHART_COLORS = [
  "#1a56db",
  "#e02424",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#8b5cf6",
  "#f43f5e",
];

export function BudgetPage() {
  const { user } = useAuthStore();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const isTreasurer = user?.role === Role.treasurer;

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AllocationPublic | null>(null);
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);

  // --- queries ---
  const { data: budget, isLoading: budgetLoading } = useQuery<Budget | null>({
    queryKey: ["budget"],
    queryFn: async () => (actor ? actor.getBudget() : null),
    enabled: !!actor && !isFetching,
  });

  const { data: allocations = [], isLoading: allocLoading } = useQuery<
    AllocationPublic[]
  >({
    queryKey: ["allocations"],
    queryFn: async () => (actor ? actor.getAllocations() : []),
    enabled: !!actor && !isFetching,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => (actor && user ? actor.getNotifications(user.id) : []),
    enabled: !!actor && !isFetching && !!user,
  });

  // --- mutations ---
  const setBudgetMutation = useMutation({
    mutationFn: async ({
      totalBudget,
      fiscalYear,
    }: { totalBudget: bigint; fiscalYear: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setBudget(totalBudget, fiscalYear);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      toast.success("Annual budget saved successfully.");
      setBudgetFormOpen(false);
    },
    onError: () => toast.error("Failed to save budget."),
  });

  const addAllocationMutation = useMutation({
    mutationFn: async ({ name, amount }: { name: string; amount: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addAllocation(name, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      toast.success("Program allocation added.");
      setAddDialogOpen(false);
    },
    onError: () => toast.error("Failed to add allocation."),
  });

  const updateAllocationMutation = useMutation({
    mutationFn: async ({
      id,
      name,
      amount,
    }: { id: bigint; name: string; amount: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateAllocation(id, name, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      toast.success("Allocation updated.");
      setEditTarget(null);
    },
    onError: () => toast.error("Failed to update allocation."),
  });

  const deleteAllocationMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteAllocation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      toast.success("Allocation deleted.");
    },
    onError: () => toast.error("Failed to delete allocation."),
  });

  // --- computed values ---
  const totalBudget = budget ? Number(budget.totalBudget) : 0;
  const fiscalYear = budget
    ? Number(budget.fiscalYear)
    : new Date().getFullYear();
  const totalAllocated = allocations.reduce(
    (s, a) => s + Number(a.allocatedAmount),
    0,
  );
  const totalSpent = allocations.reduce((s, a) => s + Number(a.spentAmount), 0);
  const unallocated = Math.max(0, totalBudget - totalAllocated);
  const remainingBalance = totalBudget - totalSpent;
  const isOverBudget = totalSpent > totalBudget && totalBudget > 0;
  const utilizationPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isLoading = budgetLoading || allocLoading;

  // Chart data
  const barChartData = allocations.map((a) => ({
    name: a.name.length > 14 ? `${a.name.slice(0, 12)}…` : a.name,
    fullName: a.name,
    allocated: Number(a.allocatedAmount),
    spent: Number(a.spentAmount),
  }));

  const pieData = [
    { name: "Allocated", value: totalAllocated },
    { name: "Unallocated", value: unallocated },
  ].filter((d) => d.value > 0);

  const statCards = [
    {
      id: "total_budget",
      title: "Total Annual Budget",
      value: peso(totalBudget),
      icon: <DollarSign size={20} />,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      id: "total_allocated",
      title: "Total Allocated",
      value: peso(totalAllocated),
      icon: <PiggyBank size={20} />,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      id: "total_spent",
      title: "Total Spent",
      value: peso(totalSpent),
      icon: <TrendingDown size={20} />,
      color: isOverBudget ? "text-destructive" : "text-foreground",
      bg: isOverBudget ? "bg-destructive/10" : "bg-muted",
    },
    {
      id: "remaining_balance",
      title: "Remaining Balance",
      value: peso(Math.abs(remainingBalance)),
      suffix: remainingBalance < 0 ? " (Deficit)" : "",
      icon: <TrendingUp size={20} />,
      color: remainingBalance < 0 ? "text-destructive" : "text-primary",
      bg: remainingBalance < 0 ? "bg-destructive/10" : "bg-primary/10",
    },
  ];

  return (
    <AppLayout unreadCount={unreadCount}>
      <div className="space-y-6" data-ocid="budget.page">
        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Budget Management
            </h2>
            <p className="text-sm text-muted-foreground">
              Fiscal Year {fiscalYear} — Allocation &amp; Utilization Tracking
            </p>
          </div>
          {isTreasurer && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBudgetFormOpen(true)}
                data-ocid="budget.set_budget_button"
              >
                <BarChart3 size={14} className="mr-1" />
                {budget ? "Update Annual Budget" : "Set Annual Budget"}
              </Button>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-ocid="budget.add_allocation_button">
                    <Plus size={14} className="mr-1" /> Add Program
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Program Allocation</DialogTitle>
                  </DialogHeader>
                  <BudgetForm
                    mode="allocation"
                    onSubmit={({ name, amount }) =>
                      addAllocationMutation.mutate({
                        name,
                        amount: BigInt(Math.round(amount * 100)),
                      })
                    }
                    isLoading={addAllocationMutation.isPending}
                    onCancel={() => setAddDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Overspending Alert */}
        {isOverBudget && (
          <div
            className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3"
            data-ocid="budget.overspending_alert"
          >
            <AlertTriangle className="text-destructive shrink-0" size={20} />
            <div>
              <p className="font-semibold text-destructive">
                Budget Exceeded — Overspending Alert
              </p>
              <p className="text-sm text-destructive/80">
                Total expenses ({peso(totalSpent)}) exceed the annual budget (
                {peso(totalBudget)}) by{" "}
                <strong>{peso(totalSpent - totalBudget)}</strong>. Immediate
                review required.
              </p>
            </div>
          </div>
        )}

        {/* Budget not set notice */}
        {!isLoading && !budget && (
          <div
            className="flex items-center gap-3 rounded-lg border border-accent/50 bg-accent/10 px-4 py-3"
            data-ocid="budget.no_budget_state"
          >
            <AlertTriangle
              className="text-accent-foreground shrink-0"
              size={20}
            />
            <p className="text-sm text-accent-foreground">
              No annual budget has been set yet.{" "}
              {isTreasurer && (
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => setBudgetFormOpen(true)}
                >
                  Set Annual Budget
                </button>
              )}
            </p>
          </div>
        )}

        {/* Stat cards */}
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          data-ocid="budget.stats.section"
        >
          {statCards.map((card) => (
            <Card key={card.id} className="border-border">
              <CardContent className="p-5">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {card.title}
                      </p>
                      <p
                        className={`mt-1 text-xl font-bold font-display ${card.color}`}
                      >
                        {card.value}
                        {"suffix" in card && card.suffix && (
                          <span className="text-sm font-normal ml-1">
                            {card.suffix}
                          </span>
                        )}
                      </p>
                    </div>
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg} ${card.color}`}
                    >
                      {card.icon}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overall Utilization Bar */}
        {!isLoading && totalBudget > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Overall Budget Utilization
                <Badge
                  variant={
                    isOverBudget
                      ? "destructive"
                      : utilizationPct > 80
                        ? "secondary"
                        : "default"
                  }
                  className="text-xs"
                  data-ocid="budget.utilization_badge"
                >
                  {utilizationPct.toFixed(1)}% used
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isOverBudget
                      ? "bg-destructive"
                      : utilizationPct > 80
                        ? "bg-accent"
                        : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(utilizationPct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₱0</span>
                <span className="font-medium">
                  {peso(totalSpent)} spent of {peso(totalBudget)}
                </span>
                <span>{peso(totalBudget)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Horizontal Bar Chart — Allocated vs Spent per program */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Program Budget Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : allocations.length === 0 ? (
                <div
                  className="flex h-64 items-center justify-center text-sm text-muted-foreground"
                  data-ocid="budget.bar_chart.empty_state"
                >
                  No program allocations configured yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={barChartData}
                    layout="vertical"
                    margin={{ left: 8, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v: number) =>
                        `₱${(v / 1000).toFixed(0)}k`
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      width={80}
                    />
                    <Tooltip
                      formatter={(v: number, name: string) => [peso(v), name]}
                    />
                    <Legend />
                    <Bar
                      dataKey="allocated"
                      name="Allocated"
                      fill="#1a56db"
                      radius={[0, 3, 3, 0]}
                    />
                    <Bar
                      dataKey="spent"
                      name="Spent"
                      fill="#e02424"
                      radius={[0, 3, 3, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Pie Chart — Allocated vs Unallocated */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Budget Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : totalBudget === 0 ? (
                <div
                  className="flex h-64 items-center justify-center text-sm text-muted-foreground"
                  data-ocid="budget.pie_chart.empty_state"
                >
                  Set the annual budget to view breakdown.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={
                            entry.name === "Allocated" ? "#1a56db" : "#d1d5db"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => peso(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Program Allocations Table */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Program Allocations
              </CardTitle>
              {!isTreasurer && (
                <Badge variant="secondary" className="text-xs">
                  View Only
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <AllocationTable
              allocations={allocations}
              isLoading={isLoading}
              isTreasurer={isTreasurer}
              editTarget={editTarget}
              onEditRequest={setEditTarget}
              onDelete={(id) => deleteAllocationMutation.mutate(id)}
              onEditSubmit={({ id, name, amount }) =>
                updateAllocationMutation.mutate({
                  id,
                  name,
                  amount: BigInt(Math.round(amount * 100)),
                })
              }
              onEditCancel={() => setEditTarget(null)}
              isDeleting={deleteAllocationMutation.isPending}
              isUpdating={updateAllocationMutation.isPending}
            />
          </CardContent>
        </Card>

        {/* Set Budget Dialog */}
        <Dialog open={budgetFormOpen} onOpenChange={setBudgetFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {budget ? "Update Annual Budget" : "Set Annual Budget"}
              </DialogTitle>
            </DialogHeader>
            <BudgetForm
              mode="budget"
              defaultTotalBudget={
                budget ? Number(budget.totalBudget) / 100 : undefined
              }
              defaultFiscalYear={
                budget ? Number(budget.fiscalYear) : new Date().getFullYear()
              }
              onSubmit={({ totalBudget: tb, fiscalYear: fy }) =>
                setBudgetMutation.mutate({
                  totalBudget: BigInt(Math.round(tb * 100)),
                  fiscalYear: BigInt(fy),
                })
              }
              isLoading={setBudgetMutation.isPending}
              onCancel={() => setBudgetFormOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Allocation Dialog */}
        <Dialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Program Allocation</DialogTitle>
            </DialogHeader>
            {editTarget && (
              <BudgetForm
                mode="allocation"
                defaultName={editTarget.name}
                defaultAmount={Number(editTarget.allocatedAmount) / 100}
                onSubmit={({ name, amount }) =>
                  updateAllocationMutation.mutate({
                    id: editTarget.id,
                    name,
                    amount: BigInt(Math.round(amount * 100)),
                  })
                }
                isLoading={updateAllocationMutation.isPending}
                onCancel={() => setEditTarget(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
