import { Role, TransactionType } from "@/backend";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAllocations,
  useDashboardSummary,
  useNotifications,
  useProjects,
  useTransactions,
} from "@/hooks/useBackend";
import { useAuthStore } from "@/store/authStore";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  FileText,
  FolderOpen,
  PiggyBank,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
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

// ── helpers ────────────────────────────────────────────────
const peso = (n: bigint | number) =>
  `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const CHART_COLORS = [
  "#1a56db",
  "#e02424",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#ec4899",
];

const TX_TYPE_LABEL: Record<string, string> = {
  income: "Income",
  expenses: "Expense",
  cashAdvance: "Cash Advance",
  reimbursement: "Reimbursement",
  projectExpenses: "Project Expense",
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Build last-6-month income vs expense data from transaction list
function buildMonthlyChartData(
  transactions: { date: bigint; txType: string; amount: bigint }[],
) {
  const now = new Date();
  const months: { month: string; income: number; expenses: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: MONTH_NAMES[d.getMonth()], income: 0, expenses: 0 });
  }
  const startTs = new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime();
  for (const tx of transactions) {
    const txMs = Number(tx.date) / 1_000_000;
    if (txMs < startTs) continue;
    const txDate = new Date(txMs);
    const monthsAgo =
      (now.getFullYear() - txDate.getFullYear()) * 12 +
      (now.getMonth() - txDate.getMonth());
    const idx = 5 - monthsAgo;
    if (idx < 0 || idx > 5) continue;
    if (tx.txType === TransactionType.income) {
      months[idx].income += Number(tx.amount);
    } else {
      months[idx].expenses += Number(tx.amount);
    }
  }
  return months;
}

// ── sub-components ───────────────────────────────────────────
function StatCard({
  title,
  value,
  icon,
  colorClass,
  bgClass,
  loading,
  suffix,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  loading: boolean;
  suffix?: string;
}) {
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-36" />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
              </p>
              <p
                className={`mt-1 truncate text-xl font-bold font-display ${colorClass}`}
              >
                {value}
                {suffix && (
                  <span className="text-xs font-medium ml-1">{suffix}</span>
                )}
              </p>
            </div>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bgClass} ${colorClass}`}
            >
              {icon}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionButton({
  to,
  icon,
  label,
  variant = "outline",
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "outline" | "destructive";
}) {
  return (
    <Button variant={variant} asChild className="flex-1 gap-2">
      <Link to={to}>
        {icon}
        <span>{label}</span>
      </Link>
    </Button>
  );
}

// ── main page ─────────────────────────────────────────────────
export function DashboardPage() {
  const { user } = useAuthStore();
  const isTreasurer = user?.role === Role.treasurer;

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const { data: allocations = [], isLoading: allocLoading } = useAllocations();
  const { data: projects = [], isLoading: projLoading } = useProjects();
  const { data: notifications = [] } = useNotifications(user?.id);

  const isLoading = summaryLoading || txLoading || allocLoading || projLoading;

  // --- Derived values ---
  const totalBudget =
    summary?.totalBudget != null ? Number(summary.totalBudget) : 0;
  const totalIncome =
    summary?.totalIncome != null ? Number(summary.totalIncome) : 0;
  const totalExpenses =
    summary?.totalExpenses != null ? Number(summary.totalExpenses) : 0;
  const remainingBalance =
    summary?.remainingBalance != null
      ? Number(summary.remainingBalance)
      : totalBudget - totalExpenses;
  const activeProjects =
    summary?.activeProjectsCount != null
      ? Number(summary.activeProjectsCount)
      : projects.filter((p) => p.status === "ongoing").length;
  const pendingLiquidations = transactions.filter(
    (t) => t.txType === TransactionType.cashAdvance,
  ).length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const utilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
  const isOverBudget = totalBudget > 0 && totalExpenses > totalBudget;
  const isLowBalance =
    !isOverBudget && totalBudget > 0 && remainingBalance / totalBudget < 0.2;

  const recentTx = [...transactions]
    .sort((a, b) => Number(b.date) - Number(a.date))
    .slice(0, 5);

  // --- Chart data ---
  const monthlyChartData = buildMonthlyChartData(transactions);

  // Budget utilization pie
  const spent = Math.max(0, totalExpenses);
  const rem = Math.max(0, remainingBalance);
  const pieData =
    totalBudget > 0
      ? [
          { name: "Spent", value: spent },
          { name: "Remaining", value: rem },
        ]
      : allocations.length > 0
        ? allocations.map((a) => ({
            name: a.name,
            value: Number(a.allocatedAmount),
          }))
        : [];

  // Stat cards config
  const statCards = [
    {
      id: "stat-budget",
      title: "Total Budget",
      value: peso(totalBudget),
      icon: <Wallet size={20} />,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      id: "stat-income",
      title: "Total Income",
      value: peso(totalIncome),
      icon: <TrendingUp size={20} />,
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
    },
    {
      id: "stat-expenses",
      title: "Total Expenses",
      value: peso(totalExpenses),
      icon: <TrendingDown size={20} />,
      colorClass: "text-destructive",
      bgClass: "bg-destructive/10",
    },
    {
      id: "stat-balance",
      title: "Remaining Balance",
      value: peso(Math.abs(remainingBalance)),
      suffix: isOverBudget ? "(Over)" : isLowBalance ? "(Low)" : undefined,
      icon: <PiggyBank size={20} />,
      colorClass: isOverBudget
        ? "text-destructive"
        : isLowBalance
          ? "text-amber-600"
          : "text-primary",
      bgClass: isOverBudget
        ? "bg-destructive/10"
        : isLowBalance
          ? "bg-amber-50"
          : "bg-primary/10",
    },
    {
      id: "stat-projects",
      title: "Active Projects",
      value: String(activeProjects),
      icon: <FolderOpen size={20} />,
      colorClass: "text-indigo-600",
      bgClass: "bg-indigo-50",
    },
    {
      id: "stat-liquidations",
      title: "Pending Liquidations",
      value: String(pendingLiquidations),
      icon: <DollarSign size={20} />,
      colorClass: "text-amber-600",
      bgClass: "bg-amber-50",
    },
  ];

  return (
    <AppLayout unreadCount={unreadCount}>
      <div className="space-y-6" data-ocid="dashboard.page">
        {/* — Header bar — */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Welcome back, {user?.name?.split(" ")[0] ?? "User"}!
            </h2>
            <p className="text-sm text-muted-foreground">
              Fiscal Year {new Date().getFullYear()} — Real-time Financial
              Overview
            </p>
          </div>
          {isOverBudget && (
            <Badge
              variant="destructive"
              className="flex items-center gap-1 px-3 py-1"
            >
              <AlertTriangle size={13} />
              Budget Exceeded
            </Badge>
          )}
        </div>

        {/* — Overspending Alert Banner — */}
        {isOverBudget && !isLoading && (
          <div
            className="flex items-start gap-3 rounded-lg border-2 border-amber-400 bg-destructive/90 px-4 py-3 text-white"
            role="alert"
            data-ocid="dashboard.overspending.error_state"
          >
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-amber-300"
            />
            <div>
              <p className="font-semibold">⚠️ Budget Overspending Alert</p>
              <p className="text-sm text-white/90">
                Total expenses ({peso(totalExpenses)}) exceed the allocated
                budget ({peso(totalBudget)}) by{" "}
                <strong>{peso(Math.abs(remainingBalance))}</strong>. Immediate
                review required.
              </p>
            </div>
          </div>
        )}

        {/* — Low Balance Warning — */}
        {isLowBalance && !isLoading && (
          <div
            className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900"
            role="alert"
            data-ocid="dashboard.low_balance.loading_state"
          >
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-amber-500"
            />
            <p className="text-sm">
              <strong>Low Balance Warning:</strong> Remaining balance (
              {peso(remainingBalance)}) is below 20% of total budget. Budget
              review recommended.
            </p>
          </div>
        )}

        {/* — Stat Cards — */}
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
          data-ocid="dashboard.stats.section"
        >
          {statCards.map((card) => (
            <StatCard
              key={card.id}
              title={card.title}
              value={card.value}
              icon={card.icon}
              colorClass={card.colorClass}
              bgClass={card.bgClass}
              loading={isLoading}
              suffix={card.suffix}
            />
          ))}
        </div>

        {/* — Budget Utilization Bar — */}
        {!isLoading && totalBudget > 0 && (
          <Card
            className="border-border"
            data-ocid="dashboard.budget_bar.section"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm font-semibold text-foreground">
                Overall Budget Utilization
                <span
                  className={`text-xs font-bold ${
                    isOverBudget
                      ? "text-destructive"
                      : utilization > 75
                        ? "text-amber-600"
                        : "text-primary"
                  }`}
                >
                  {utilization.toFixed(1)}% used
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isOverBudget
                      ? "bg-destructive"
                      : utilization > 75
                        ? "bg-accent"
                        : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>₱0.00</span>
                <span className="font-medium">{peso(totalBudget)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* — Charts Row — */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Monthly Bar Chart (spans 3 cols) */}
          <Card
            className="border-border lg:col-span-3"
            data-ocid="dashboard.monthly_chart.section"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Monthly Income vs Expenses (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyChartData} barGap={4}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.92 0 0)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) =>
                        `₱${(v / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      formatter={(v: number) => peso(v)}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#1a56db"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expenses"
                      name="Expenses"
                      fill="#e02424"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Budget Utilization Donut (spans 2 cols) */}
          <Card
            className="border-border lg:col-span-2"
            data-ocid="dashboard.budget_donut.section"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                {allocations.length > 0 && totalBudget === 0
                  ? "Budget Allocations"
                  : "Budget Utilization"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allocLoading || summaryLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : pieData.length === 0 ? (
                <div
                  className="flex h-56 flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
                  data-ocid="dashboard.budget_donut.empty_state"
                >
                  <BarChart3 size={32} className="text-border" />
                  <p>No budget data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={
                            entry.name === "Spent"
                              ? "#e02424"
                              : entry.name === "Remaining"
                                ? "#1a56db"
                                : CHART_COLORS[
                                    pieData.indexOf(entry) % CHART_COLORS.length
                                  ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => peso(v)}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* — Quick Actions + Recent Transactions Row — */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card
            className="border-border"
            data-ocid="dashboard.quick_actions.section"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isTreasurer && (
                <>
                  <div className="flex gap-2">
                    <QuickActionButton
                      to="/transactions"
                      icon={<PlusCircle size={15} />}
                      label="Add Transaction"
                      variant="default"
                    />
                  </div>
                  <div className="flex gap-2">
                    <QuickActionButton
                      to="/projects"
                      icon={<FolderOpen size={15} />}
                      label="Add Project"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <QuickActionButton
                  to="/coa"
                  icon={<FileText size={15} />}
                  label="Generate Report"
                  variant={isTreasurer ? "outline" : "default"}
                />
              </div>
              <div className="flex gap-2">
                <QuickActionButton
                  to="/budget"
                  icon={<BarChart3 size={15} />}
                  label="View Budget"
                />
              </div>
              {!isTreasurer && (
                <p className="pt-1 text-xs text-muted-foreground">
                  ℹ️ Chairperson view — Add actions are restricted to the SK
                  Treasurer.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions (spans 2 cols) */}
          <Card
            className="border-border lg:col-span-2"
            data-ocid="dashboard.transactions.section"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm font-semibold">
                Recent Transactions
                <Link
                  to="/transactions"
                  className="flex items-center gap-1 text-xs text-primary transition-colors hover:underline"
                  data-ocid="dashboard.transactions.link"
                >
                  View all <ArrowUpRight size={12} />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : recentTx.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground"
                  data-ocid="dashboard.transactions.empty_state"
                >
                  <DollarSign size={28} className="text-border" />
                  <p>No transactions recorded yet.</p>
                  {isTreasurer && (
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/transactions">
                        <PlusCircle size={13} className="mr-1" /> Record First
                        Transaction
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 text-left text-xs font-semibold text-muted-foreground">
                          Date
                        </th>
                        <th className="pb-2 text-left text-xs font-semibold text-muted-foreground">
                          Description
                        </th>
                        <th className="pb-2 text-left text-xs font-semibold text-muted-foreground">
                          Type
                        </th>
                        <th className="pb-2 text-right text-xs font-semibold text-muted-foreground">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentTx.map((tx, i) => (
                        <tr
                          key={String(tx.id)}
                          data-ocid={`dashboard.transaction.item.${i + 1}`}
                        >
                          <td className="py-2.5 pr-3 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(
                              Number(tx.date) / 1_000_000,
                            ).toLocaleDateString("en-PH", {
                              month: "short",
                              day: "numeric",
                              year: "2-digit",
                            })}
                          </td>
                          <td className="py-2.5 pr-3">
                            <p className="max-w-[180px] truncate font-medium text-foreground">
                              {tx.description}
                            </p>
                          </td>
                          <td className="py-2.5 pr-3">
                            <Badge
                              variant={
                                tx.txType === TransactionType.income
                                  ? "default"
                                  : "secondary"
                              }
                              className={`text-[10px] px-1.5 py-0.5 ${
                                tx.txType === TransactionType.income
                                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                                  : tx.txType === TransactionType.expenses
                                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {TX_TYPE_LABEL[tx.txType] ?? tx.txType}
                            </Badge>
                          </td>
                          <td
                            className={`py-2.5 text-right font-semibold tabular-nums ${
                              tx.txType === TransactionType.income
                                ? "text-emerald-600"
                                : "text-destructive"
                            }`}
                          >
                            {tx.txType === TransactionType.income ? "+" : "-"}
                            {peso(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
