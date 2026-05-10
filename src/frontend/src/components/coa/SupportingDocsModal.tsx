import type { CoaReportPublic, SupportingDocPublic } from "@/backend";
import { createActor } from "@/backend";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { COA_REPORT_LABELS } from "@/lib/coaUtils";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileCheck, Loader2 } from "lucide-react";

const SUPPORTING_DOC_TYPES = [
  "Disbursement Vouchers",
  "Official Receipts",
  "Deposit Slips",
  "Cash Advance Records",
  "Liquidation Reports",
  "Procurement Documents",
  "Payroll Records",
  "Bank Reconciliation Statements",
];

interface SupportingDocsModalProps {
  report: CoaReportPublic | null;
  onClose: () => void;
}

export function SupportingDocsModal({
  report,
  onClose,
}: SupportingDocsModalProps) {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();

  const { data: docs = [], isLoading } = useQuery<SupportingDocPublic[]>({
    queryKey: ["coa", "docs", report?.id?.toString()],
    queryFn: async () => {
      if (!actor || !report) return [];
      return actor.getSupportingDocs(report.id);
    },
    enabled: !!actor && !isFetching && !!report,
  });

  const submitMutation = useMutation({
    mutationFn: async (docType: string) => {
      if (!actor || !report) throw new Error("Actor not ready");
      return actor.submitSupportingDoc(report.id, docType);
    },
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["coa", "docs", report?.id?.toString()],
      }),
  });

  const submittedTypes = new Set(
    docs.filter((d) => d.isSubmitted).map((d) => d.docType),
  );
  const submittedCount = submittedTypes.size;
  const totalCount = SUPPORTING_DOC_TYPES.length;

  return (
    <Dialog open={!!report} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="sm:max-w-lg"
        data-ocid="coa.supporting_docs.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">
            Supporting Documents
          </DialogTitle>
          {report && (
            <p className="text-sm text-muted-foreground">
              {COA_REPORT_LABELS[report.reportType]} — FY{" "}
              {String(report.fiscalYear)}
              {report.quarter ? ` Q${String(report.quarter)}` : ""}
            </p>
          )}
        </DialogHeader>

        <div className="mt-1">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Checklist
            </p>
            <span className="text-xs font-semibold text-primary">
              {submittedCount}/{totalCount} submitted
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-4 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(submittedCount / totalCount) * 100}%` }}
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {SUPPORTING_DOC_TYPES.map((docType, index) => {
                const isChecked = submittedTypes.has(docType);
                const isPending =
                  submitMutation.isPending &&
                  submitMutation.variables === docType;
                return (
                  <div
                    key={docType}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-smooth ${
                      isChecked
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-card"
                    }`}
                    data-ocid={`coa.supporting_doc.item.${index + 1}`}
                  >
                    <div className="flex-shrink-0">
                      {isPending ? (
                        <Loader2
                          size={16}
                          className="animate-spin text-primary"
                        />
                      ) : (
                        <Checkbox
                          id={`doc-${index}`}
                          checked={isChecked}
                          disabled={isChecked || submitMutation.isPending}
                          onCheckedChange={() => {
                            if (!isChecked) submitMutation.mutate(docType);
                          }}
                          data-ocid={`coa.supporting_doc.checkbox.${index + 1}`}
                        />
                      )}
                    </div>
                    <label
                      htmlFor={`doc-${index}`}
                      className={`flex-1 cursor-pointer text-sm ${
                        isChecked
                          ? "font-medium text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {docType}
                    </label>
                    {isChecked && (
                      <FileCheck
                        size={15}
                        className="text-primary flex-shrink-0"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="coa.supporting_docs.close_button"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
