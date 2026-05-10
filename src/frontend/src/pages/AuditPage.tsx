import { AuditAction, Role } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogs } from "@/hooks/useBackend";
import { useAuthStore } from "@/store/authStore";
import { Download, Shield, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AuditLogTable } from "../components/audit/AuditLogTable";
import { AppLayout } from "../components/layout/AppLayout";

const PAGE_SIZE = 20;

function SummaryCard({
  title,
  value,
  icon,
  color,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-16" />
          ) : (
            <p className="mt-1 text-3xl font-bold text-foreground">
              {value.toLocaleString()}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-2.5 ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

export function AuditPage() {
  const { user } = useAuthStore();
  const [emailFilter, setEmailFilter] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const { data: logs = [], isLoading } = useAuditLogs(null);

  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const todayActions = useMemo(
    () =>
      logs.filter((l) => Number(l.timestamp) / 1_000_000 >= startOfDay).length,
    [logs, startOfDay],
  );

  const monthActions = useMemo(
    () =>
      logs.filter((l) => Number(l.timestamp) / 1_000_000 >= startOfMonth)
        .length,
    [logs, startOfMonth],
  );

  const loginsToday = useMemo(
    () =>
      logs.filter(
        (l) =>
          l.action === AuditAction.login &&
          Number(l.timestamp) / 1_000_000 >= startOfDay,
      ).length,
    [logs, startOfDay],
  );

  const filtered = useMemo(() => {
    let result = [...logs];

    // Role-based filtering: chairperson can see all, treasurer sees all too (per spec)
    // Both roles can see all logs per requirements
    if (user?.role === Role.chairperson) {
      // Chairperson: can see treasurer logs and their own — effectively all
    } else if (user?.role === Role.treasurer) {
      // Treasurer: can see their own logs and all logs — effectively all
    }

    if (emailFilter.trim()) {
      const q = emailFilter.toLowerCase();
      result = result.filter((l) => l.userEmail.toLowerCase().includes(q));
    }

    if (actionFilter !== "all") {
      result = result.filter((l) => l.action === actionFilter);
    }

    if (fromDate) {
      const from = new Date(fromDate).getTime();
      result = result.filter((l) => Number(l.timestamp) / 1_000_000 >= from);
    }

    if (toDate) {
      const to = new Date(toDate).getTime() + 86_400_000; // include full day
      result = result.filter((l) => Number(l.timestamp) / 1_000_000 <= to);
    }

    // Sort most recent first
    result.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    return result;
  }, [logs, emailFilter, actionFilter, fromDate, toDate, user]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleExport() {
    toast.info("Feature coming soon", {
      description: "Audit log export will be available in a future update.",
    });
  }

  function handleFilterChange() {
    setPage(1);
  }

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Shield size={18} className="text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Audit Trail
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            System Activity Log — All actions are recorded for compliance
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleExport}
          data-ocid="audit.export_button"
          className="gap-2"
        >
          <Download size={16} />
          Export Log
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Actions Today"
          value={todayActions}
          icon={<TrendingUp size={18} className="text-primary" />}
          color="bg-primary/10"
          loading={isLoading}
        />
        <SummaryCard
          title="Total This Month"
          value={monthActions}
          icon={<Shield size={18} className="text-blue-600" />}
          color="bg-blue-50"
          loading={isLoading}
        />
        <SummaryCard
          title="Logins Today"
          value={loginsToday}
          icon={<Users size={18} className="text-emerald-600" />}
          color="bg-emerald-50"
          loading={isLoading}
        />
      </div>

      {/* Filter Bar */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Filter Logs
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Filter by email..."
            value={emailFilter}
            onChange={(e) => {
              setEmailFilter(e.target.value);
              handleFilterChange();
            }}
            data-ocid="audit.search_input"
            className="bg-background"
          />
          <Select
            value={actionFilter}
            onValueChange={(v) => {
              setActionFilter(v);
              handleFilterChange();
            }}
          >
            <SelectTrigger
              data-ocid="audit.action_filter.select"
              className="bg-background"
            >
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value={AuditAction.login}>Login</SelectItem>
              <SelectItem value={AuditAction.addTransaction}>
                Add Transaction
              </SelectItem>
              <SelectItem value={AuditAction.editTransaction}>
                Edit Transaction
              </SelectItem>
              <SelectItem value={AuditAction.deleteTransaction}>
                Delete Transaction
              </SelectItem>
              <SelectItem value={AuditAction.generateReport}>
                Generate Report
              </SelectItem>
              <SelectItem value={AuditAction.other}>Other</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              handleFilterChange();
            }}
            data-ocid="audit.from_date.input"
            className="bg-background"
            placeholder="From date"
          />
          <Input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              handleFilterChange();
            }}
            data-ocid="audit.to_date.input"
            className="bg-background"
            placeholder="To date"
          />
        </div>
        {(emailFilter || actionFilter !== "all" || fromDate || toDate) && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEmailFilter("");
                setActionFilter("all");
                setFromDate("");
                setToDate("");
                setPage(1);
              }}
              data-ocid="audit.clear_filters.button"
              className="text-xs"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <AuditLogTable
        logs={paginated}
        isLoading={isLoading}
        totalCount={filtered.length}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </AppLayout>
  );
}
