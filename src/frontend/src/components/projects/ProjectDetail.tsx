import type { ProjectPublic, TransactionPublic } from "@/backend";
import { ProjectStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/hooks/useBackend";
import { AlertTriangle, Calendar, FileText, Folder, X } from "lucide-react";

const PESO = (n: bigint | number) =>
  `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const formatDate = (ts: bigint) =>
  new Date(Number(ts) / 1_000_000).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  [ProjectStatus.planning]: {
    label: "Planning",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  [ProjectStatus.ongoing]: {
    label: "Ongoing",
    className: "bg-accent/20 text-yellow-800 border-accent/40",
  },
  [ProjectStatus.completed]: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
};

const TX_TYPE_LABELS: Record<string, string> = {
  income: "Income",
  expenses: "Expenses",
  cashAdvance: "Cash Advance",
  reimbursement: "Reimbursement",
  projectExpenses: "Project Expenses",
};

interface ProjectDetailProps {
  project: ProjectPublic | null;
  open: boolean;
  onClose: () => void;
  isTreasurer: boolean;
  onEdit: (project: ProjectPublic) => void;
  onDelete: (project: ProjectPublic) => void;
}

export function ProjectDetail({
  project,
  open,
  onClose,
  isTreasurer,
  onEdit,
  onDelete,
}: ProjectDetailProps) {
  const { data: allTransactions = [], isLoading: txLoading } = useTransactions(
    project ? { projectId: project.id } : null,
  );

  // Filter to only this project's transactions
  const transactions: TransactionPublic[] = project
    ? allTransactions.filter(
        (t) => t.projectId !== undefined && t.projectId === project.id,
      )
    : [];

  if (!project) return null;

  const budget = Number(project.budgetAllocation);
  const spent = Number(project.totalExpenses);
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOverBudget = spent > budget;
  const statusCfg = STATUS_CONFIG[project.status];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        className="w-full sm:max-w-lg overflow-y-auto"
        data-ocid="projects.detail.sheet"
      >
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <SheetTitle className="font-display text-xl leading-tight">
                {project.name}
              </SheetTitle>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge
                  className={`text-xs px-2 py-0.5 border font-medium ${statusCfg.className}`}
                >
                  {statusCfg.label}
                </Badge>
                {isOverBudget && (
                  <Badge
                    variant="destructive"
                    className="text-xs flex items-center gap-1"
                  >
                    <AlertTriangle size={10} /> Budget Exceeded
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0"
              data-ocid="projects.detail.close_button"
            >
              <X size={18} />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 pt-5">
          {/* Description */}
          {project.description && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Description
              </h4>
              <p className="text-sm text-foreground">{project.description}</p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Start Date
              </h4>
              <div className="flex items-center gap-1.5 text-sm">
                <Calendar size={13} className="text-muted-foreground" />
                <span>{formatDate(project.startDate)}</span>
              </div>
            </div>
            {project.endDate && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  End Date
                </h4>
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar size={13} className="text-muted-foreground" />
                  <span>{formatDate(project.endDate)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Budget section */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Financial Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Allocated Budget</span>
                <span className="font-mono font-semibold">{PESO(budget)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Expenses</span>
                <span
                  className={`font-mono font-semibold ${
                    isOverBudget ? "text-destructive" : ""
                  }`}
                >
                  {PESO(spent)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="text-muted-foreground font-medium">
                  {isOverBudget ? "Over Budget" : "Remaining"}
                </span>
                <span
                  className={`font-mono font-bold ${
                    isOverBudget ? "text-destructive" : "text-primary"
                  }`}
                >
                  {isOverBudget
                    ? `(${PESO(spent - budget)})`
                    : PESO(budget - spent)}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget
                      ? "bg-destructive"
                      : pct > 80
                        ? "bg-accent"
                        : "bg-primary"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {pct.toFixed(1)}% of budget utilized
              </p>
            </div>
          </div>

          {/* Linked Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <FileText size={12} />
                Linked Transactions
              </h4>
              <span className="text-xs text-muted-foreground">
                {transactions.length} record
                {transactions.length !== 1 ? "s" : ""}
              </span>
            </div>

            {txLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div
                className="py-6 text-center border border-dashed border-border rounded-lg text-sm text-muted-foreground"
                data-ocid="projects.detail.transactions.empty_state"
              >
                <Folder size={24} className="mx-auto mb-2 opacity-40" />
                No transactions linked to this project.
              </div>
            ) : (
              <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                {transactions.map((tx, i) => (
                  <div
                    key={String(tx.id)}
                    className="flex items-center gap-3 px-3 py-2.5 bg-card"
                    data-ocid={`projects.detail.transaction.item.${i + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          Number(tx.date) / 1_000_000,
                        ).toLocaleDateString("en-PH")}{" "}
                        &middot; {TX_TYPE_LABELS[tx.txType] ?? tx.txType}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold font-mono ${
                        tx.txType === "income"
                          ? "text-primary"
                          : "text-destructive"
                      }`}
                    >
                      {tx.txType === "income" ? "+" : "-"}
                      {PESO(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="text-xs text-muted-foreground pt-2 border-t border-border space-y-0.5">
            <p>
              Created:{" "}
              {new Date(Number(project.createdAt) / 1_000_000).toLocaleString(
                "en-PH",
              )}
            </p>
            <p>
              Last updated:{" "}
              {new Date(Number(project.updatedAt) / 1_000_000).toLocaleString(
                "en-PH",
              )}
            </p>
          </div>

          {/* Actions (Treasurer only) */}
          {isTreasurer && (
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onClose();
                  onEdit(project);
                }}
                data-ocid="projects.detail.edit_button"
              >
                Edit Project
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  onClose();
                  onDelete(project);
                }}
                data-ocid="projects.detail.delete_button"
              >
                Delete Project
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
