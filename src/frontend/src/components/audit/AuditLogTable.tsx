import type { AuditLog } from "@/backend";
import { AuditAction } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileSearch,
  FileText,
  LogIn,
  MoreHorizontal,
  PenLine,
  Plus,
  Trash2,
} from "lucide-react";

interface ActionMeta {
  label: string;
  className: string;
  icon: React.ReactNode;
}

const ACTION_META: Record<AuditAction, ActionMeta> = {
  [AuditAction.login]: {
    label: "Login",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <LogIn size={11} />,
  },
  [AuditAction.addTransaction]: {
    label: "Add Transaction",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <Plus size={11} />,
  },
  [AuditAction.editTransaction]: {
    label: "Edit Transaction",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <PenLine size={11} />,
  },
  [AuditAction.deleteTransaction]: {
    label: "Delete Transaction",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: <Trash2 size={11} />,
  },
  [AuditAction.generateReport]: {
    label: "Generate Report",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <FileText size={11} />,
  },
  [AuditAction.other]: {
    label: "Other",
    className: "bg-muted text-muted-foreground border-border",
    icon: <MoreHorizontal size={11} />,
  },
};

function ActionBadge({ action }: { action: AuditAction }) {
  const meta = ACTION_META[action] ?? ACTION_META[AuditAction.other];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${meta.className}`}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const d = new Date(ms);
  return d.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function SkeletonRows() {
  return (
    <>
      {["r0", "r1", "r2", "r3", "r4", "r5"].map((k) => (
        <TableRow key={k}>
          <TableCell>
            <Skeleton className="h-4 w-36" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-28 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AuditLogTable({
  logs,
  isLoading,
  totalCount,
  page,
  totalPages,
  onPageChange,
}: AuditLogTableProps) {
  const isEmpty = !isLoading && logs.length === 0;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Table header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Activity Log</p>
        <p className="text-xs text-muted-foreground">
          {isLoading
            ? "Loading..."
            : `${totalCount.toLocaleString()} total record${totalCount !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-44 whitespace-nowrap font-semibold">
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  Timestamp
                </span>
              </TableHead>
              <TableHead className="font-semibold">User Email</TableHead>
              <TableHead className="font-semibold">Action</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows />
            ) : isEmpty ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div
                    className="flex flex-col items-center justify-center py-16 text-center"
                    data-ocid="audit.empty_state"
                  >
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      <FileSearch size={24} className="text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-foreground">
                      No audit logs found
                    </p>
                    <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                      No system activity matches your current filters. Try
                      adjusting your search criteria.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, i) => (
                <TableRow
                  key={log.id.toString()}
                  data-ocid={`audit.item.${i + 1}`}
                  className="transition-colors hover:bg-muted/30"
                >
                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {formatTimestamp(log.timestamp)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm font-medium text-foreground">
                    {log.userEmail}
                  </TableCell>
                  <TableCell>
                    <ActionBadge action={log.action} />
                  </TableCell>
                  <TableCell className="max-w-[300px] text-sm text-muted-foreground">
                    <span className="line-clamp-2">{log.description}</span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && totalCount > 0 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              data-ocid="audit.pagination_prev"
              className="h-8 w-8 p-0"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              let pageNum = i + 1;
              if (totalPages > 7) {
                if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
              }
              return (
                <Button
                  key={pageNum}
                  type="button"
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  data-ocid={`audit.page.${pageNum}`}
                  className="h-8 w-8 p-0 text-xs"
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              data-ocid="audit.pagination_next"
              className="h-8 w-8 p-0"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
