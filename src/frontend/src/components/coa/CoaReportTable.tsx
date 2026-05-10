import { CoaReportStatus } from "@/backend";
import type { CoaReportPublic } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { COA_REPORT_LABELS } from "@/lib/coaUtils";
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";

const STATUS_BADGE: Record<
  CoaReportStatus,
  { label: string; className: string }
> = {
  [CoaReportStatus.draft]: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border border-border",
  },
  [CoaReportStatus.pendingReview]: {
    label: "Pending Review",
    className: "bg-accent/20 text-accent-foreground border border-accent/40",
  },
  [CoaReportStatus.submitted]: {
    label: "Submitted",
    className: "bg-primary/15 text-primary border border-primary/30",
  },
  [CoaReportStatus.approved]: {
    label: "Approved",
    className: "bg-green-100 text-green-700 border border-green-300",
  },
  [CoaReportStatus.needsRevision]: {
    label: "Needs Revision",
    className:
      "bg-destructive/15 text-destructive border border-destructive/30",
  },
};

const STATUS_OPTIONS: CoaReportStatus[] = [
  CoaReportStatus.draft,
  CoaReportStatus.pendingReview,
  CoaReportStatus.submitted,
  CoaReportStatus.approved,
  CoaReportStatus.needsRevision,
];

function formatDeadline(ts?: bigint): {
  label: string;
  isOverdue: boolean;
  isUrgent: boolean;
} {
  if (!ts) return { label: "—", isOverdue: false, isUrgent: false };
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  const now = Date.now();
  const diffDays = (ms - now) / (1000 * 60 * 60 * 24);
  return {
    label: date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    isOverdue: diffDays < 0,
    isUrgent: diffDays >= 0 && diffDays <= 7,
  };
}

function formatPeriod(report: CoaReportPublic): string {
  const fy = `FY ${String(report.fiscalYear)}`;
  if (report.quarter) return `${fy} Q${String(report.quarter)}`;
  return fy;
}

interface UpdateStatusFormProps {
  report: CoaReportPublic;
  onUpdate: (id: bigint, status: CoaReportStatus, notes: string) => void;
  isLoading: boolean;
  canEdit: boolean;
}

function UpdateStatusForm({
  report,
  onUpdate,
  isLoading,
  canEdit,
}: UpdateStatusFormProps) {
  const [notes, setNotes] = useState(report.notes);

  return (
    <div className="p-3 space-y-2 w-64">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Change Status
      </p>
      <div className="space-y-1">
        {STATUS_OPTIONS.map((status) => {
          const s = STATUS_BADGE[status];
          const isActive = report.status === status;
          return (
            <button
              key={status}
              type="button"
              disabled={!canEdit || isLoading || isActive}
              onClick={() => onUpdate(report.id, status, notes)}
              className={`w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs transition-smooth ${
                isActive
                  ? "bg-primary/10 font-semibold cursor-default"
                  : canEdit
                    ? "hover:bg-muted cursor-pointer"
                    : "cursor-not-allowed opacity-50"
              }`}
              data-ocid={`coa.status_option.${status}`}
            >
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}
              >
                {s.label}
              </span>
              {isActive && <span className="ml-auto text-primary">✓</span>}
            </button>
          );
        })}
      </div>
      {canEdit && (
        <div className="pt-1 space-y-1">
          <p className="text-xs text-muted-foreground">Notes</p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-xs h-16 resize-none"
            placeholder="Add a note…"
            data-ocid="coa.status_notes.textarea"
          />
        </div>
      )}
    </div>
  );
}

interface CoaReportTableProps {
  reports: CoaReportPublic[];
  overdueIds: Set<string>;
  isLoading: boolean;
  onUpdateStatus: (id: bigint, status: CoaReportStatus, notes: string) => void;
  onViewDocs: (report: CoaReportPublic) => void;
  isUpdating: boolean;
  canEdit: boolean;
}

export function CoaReportTable({
  reports,
  overdueIds,
  isLoading,
  onUpdateStatus,
  onViewDocs,
  isUpdating,
  canEdit,
}: CoaReportTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-14 text-muted-foreground"
        data-ocid="coa.reports.empty_state"
      >
        <FileText size={40} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">No COA reports found</p>
        <p className="text-xs mt-1">
          Add your first report using the button above.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold text-xs uppercase tracking-wide">
              Report Name
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wide">
              Period
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wide">
              Status
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wide">
              Deadline
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wide">
              Last Updated
            </TableHead>
            <TableHead className="w-24 font-semibold text-xs uppercase tracking-wide text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report, i) => {
            const isOverdue = overdueIds.has(String(report.id));
            const dl = formatDeadline(report.deadline);
            const badge = STATUS_BADGE[report.status];
            const updatedAt = new Date(
              Number(report.createdAt) / 1_000_000,
            ).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <TableRow
                key={String(report.id)}
                className={`transition-smooth ${
                  isOverdue
                    ? "bg-destructive/5 hover:bg-destructive/10"
                    : "hover:bg-muted/30"
                }`}
                data-ocid={`coa.report.item.${i + 1}`}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {isOverdue && (
                      <AlertTriangle
                        size={14}
                        className="text-destructive flex-shrink-0"
                      />
                    )}
                    <span className="text-sm">
                      {COA_REPORT_LABELS[report.reportType]}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatPeriod(report)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      badge.className
                    }`}
                  >
                    {badge.label}
                  </span>
                </TableCell>
                <TableCell>
                  {dl.label === "—" ? (
                    <span className="text-sm text-muted-foreground">—</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {dl.isOverdue && (
                        <AlertTriangle size={12} className="text-destructive" />
                      )}
                      {dl.isUrgent && !dl.isOverdue && (
                        <Clock size={12} className="text-accent-foreground" />
                      )}
                      <span
                        className={`text-sm ${
                          dl.isOverdue
                            ? "text-destructive font-semibold"
                            : dl.isUrgent
                              ? "text-accent-foreground font-semibold"
                              : "text-muted-foreground"
                        }`}
                      >
                        {dl.label}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {updatedAt}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => onViewDocs(report)}
                      data-ocid={`coa.view_docs_button.${i + 1}`}
                    >
                      <FileText size={13} className="mr-1" /> Docs
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          data-ocid={`coa.report_actions.${i + 1}`}
                        >
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="p-0">
                        <DropdownMenuLabel className="px-3 py-2 text-xs">
                          Report Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          asChild
                          onSelect={(e) => e.preventDefault()}
                        >
                          <UpdateStatusForm
                            report={report}
                            onUpdate={onUpdateStatus}
                            isLoading={isUpdating}
                            canEdit={canEdit}
                          />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export { formatPeriod };
export type { CoaReportStatus };
