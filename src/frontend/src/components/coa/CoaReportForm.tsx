import { CoaReportType } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const REPORT_TYPE_OPTIONS: {
  value: CoaReportType;
  label: string;
  period: string;
}[] = [
  {
    value: CoaReportType.qsrp,
    label: "Statement of Receipts and Payments (QSRP)",
    period: "quarterly",
  },
  {
    value: CoaReportType.raaf,
    label: "Accountability for Accountable Forms (RAAF)",
    period: "quarterly",
  },
  {
    value: CoaReportType.budgetVsActual,
    label: "Budget vs Actual Summary",
    period: "quarterly",
  },
  {
    value: CoaReportType.asrp,
    label: "Annual Statement of Receipts and Payments (ASRP)",
    period: "annual",
  },
  {
    value: CoaReportType.inventoryReport,
    label: "Inventory Report",
    period: "annual",
  },
  {
    value: CoaReportType.notesToFS,
    label: "Notes to Financial Statements",
    period: "annual",
  },
];

interface CoaReportFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    reportType: CoaReportType;
    fiscalYear: bigint;
    quarter: bigint | null;
    deadline: bigint | null;
  }) => void;
  isLoading?: boolean;
}

export function CoaReportForm({
  open,
  onClose,
  onSubmit,
  isLoading,
}: CoaReportFormProps) {
  const currentYear = new Date().getFullYear();
  const [reportType, setReportType] = useState<CoaReportType>(
    CoaReportType.qsrp,
  );
  const [fiscalYear, setFiscalYear] = useState(String(currentYear));
  const [quarter, setQuarter] = useState("1");
  const [deadline, setDeadline] = useState("");

  const selectedOption = REPORT_TYPE_OPTIONS.find(
    (o) => o.value === reportType,
  );
  const isQuarterly = selectedOption?.period === "quarterly";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deadlineMs = deadline
      ? BigInt(new Date(deadline).getTime()) * 1_000_000n
      : null;
    onSubmit({
      reportType,
      fiscalYear: BigInt(fiscalYear || currentYear),
      quarter: isQuarterly ? BigInt(quarter) : null,
      deadline: deadlineMs,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="coa.add_report.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">
            Add COA Report
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reportType">Report Type</Label>
            <Select
              value={reportType}
              onValueChange={(v) => setReportType(v as CoaReportType)}
            >
              <SelectTrigger id="reportType" data-ocid="coa.report_type.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fiscalYear">Fiscal Year</Label>
              <Input
                id="fiscalYear"
                type="number"
                min="2000"
                max="2099"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                data-ocid="coa.fiscal_year.input"
              />
            </div>
            {isQuarterly && (
              <div className="space-y-1.5">
                <Label htmlFor="quarter">Quarter</Label>
                <Select value={quarter} onValueChange={setQuarter}>
                  <SelectTrigger id="quarter" data-ocid="coa.quarter.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1 (Jan–Mar)</SelectItem>
                    <SelectItem value="2">Q2 (Apr–Jun)</SelectItem>
                    <SelectItem value="3">Q3 (Jul–Sep)</SelectItem>
                    <SelectItem value="4">Q4 (Oct–Dec)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              data-ocid="coa.deadline.input"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="coa.add_report.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              data-ocid="coa.add_report.submit_button"
            >
              {isLoading ? "Adding…" : "Add Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
