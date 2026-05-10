import { CoaReportType } from "@/backend";

export const COA_REPORT_LABELS: Record<CoaReportType, string> = {
  [CoaReportType.qsrp]: "Statement of Receipts and Payments (QSRP)",
  [CoaReportType.raaf]: "Accountability for Accountable Forms (RAAF)",
  [CoaReportType.budgetVsActual]: "Budget vs Actual Summary",
  [CoaReportType.asrp]: "Annual Statement of Receipts and Payments (ASRP)",
  [CoaReportType.inventoryReport]: "Inventory Report",
  [CoaReportType.notesToFS]: "Notes to Financial Statements",
};

export const QUARTERLY_TYPES: CoaReportType[] = [
  CoaReportType.qsrp,
  CoaReportType.raaf,
  CoaReportType.budgetVsActual,
];
export const ANNUAL_TYPES: CoaReportType[] = [
  CoaReportType.asrp,
  CoaReportType.inventoryReport,
  CoaReportType.notesToFS,
];
