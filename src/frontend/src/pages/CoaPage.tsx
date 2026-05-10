import type {
  CoaReportPublic,
  CoaReportStatus,
  CoaReportType,
} from "@/backend";
import { createActor } from "@/backend";
import { CoaReportForm } from "@/components/coa/CoaReportForm";
import { CoaReportTable } from "@/components/coa/CoaReportTable";
import { SupportingDocsModal } from "@/components/coa/SupportingDocsModal";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ANNUAL_TYPES, QUARTERLY_TYPES } from "@/lib/coaUtils";
import { useAuthStore } from "@/store/authStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FilePlus,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function CoaPage() {
  const { user } = useAuthStore();
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();

  const canEdit = user?.role === "treasurer" || user?.role === "chairperson";
  const canAdd = user?.role === "treasurer";

  const [activeTab, setActiveTab] = useState<"all" | "quarterly" | "annual">(
    "all",
  );
  const [addOpen, setAddOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CoaReportPublic | null>(
    null,
  );

  // ─── Queries ────────────────────────────────────────────────────────────
  const { data: allReports = [], isLoading: reportsLoading } = useQuery<
    CoaReportPublic[]
  >({
    queryKey: ["coa", "reports"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCoaReports();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: overdueReports = [] } = useQuery<CoaReportPublic[]>({
    queryKey: ["coa", "overdue"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOverdueReports();
    },
    enabled: !!actor && !isFetching,
  });

  // ─── Mutations ──────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async (data: {
      reportType: CoaReportType;
      fiscalYear: bigint;
      quarter: bigint | null;
      deadline: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addCoaReport(
        data.reportType,
        data.fiscalYear,
        data.quarter,
        data.deadline,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coa"] });
      setAddOpen(false);
      toast.success("COA report added successfully.");
    },
    onError: () => toast.error("Failed to add report. Please try again."),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: { id: bigint; status: CoaReportStatus; notes: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateCoaReport(id, status, notes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coa"] });
      toast.success("Report status updated.");
    },
    onError: () => toast.error("Failed to update status."),
  });

  // ─── Derived stats ──────────────────────────────────────────────────────
  const overdueIds = useMemo(
    () => new Set(overdueReports.map((r) => String(r.id))),
    [overdueReports],
  );

  const stats = useMemo(() => {
    const total = allReports.length;
    const approved = allReports.filter((r) => r.status === "approved").length;
    const pendingReview = allReports.filter(
      (r) => r.status === "pendingReview",
    ).length;
    const overdue = overdueReports.length;
    return { total, approved, pendingReview, overdue };
  }, [allReports, overdueReports]);

  // Upcoming deadlines within 7 days
  const upcomingDeadlines = useMemo(() => {
    const now = Date.now();
    return allReports.filter((r) => {
      if (!r.deadline) return false;
      const ms = Number(r.deadline) / 1_000_000;
      const diffDays = (ms - now) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    });
  }, [allReports]);

  // Filtered reports by tab
  const displayedReports = useMemo(() => {
    if (activeTab === "quarterly")
      return allReports.filter((r) =>
        QUARTERLY_TYPES.includes(r.reportType as CoaReportType),
      );
    if (activeTab === "annual")
      return allReports.filter((r) =>
        ANNUAL_TYPES.includes(r.reportType as CoaReportType),
      );
    return allReports;
  }, [allReports, activeTab]);

  const handleUpdateStatus = (
    id: bigint,
    status: CoaReportStatus,
    notes: string,
  ) => {
    updateMutation.mutate({ id, status, notes });
  };

  const statCards = [
    {
      label: "Total Reports",
      value: stats.total,
      icon: <ClipboardList size={18} />,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: <CheckCircle2 size={18} />,
      color: "text-green-700",
      bg: "bg-green-100",
    },
    {
      label: "Pending Review",
      value: stats.pendingReview,
      icon: <Clock size={18} />,
      color: "text-accent-foreground",
      bg: "bg-accent/20",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: <AlertTriangle size={18} />,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6" data-ocid="coa.page">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                COA Compliance Center
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Track and manage COA-required financial reports for SK
                compliance. Ensure all quarterly and annual filings are
                submitted on time.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Export feature coming soon.")}
              data-ocid="coa.export_button"
            >
              <Download size={14} className="mr-1.5" /> Export
            </Button>
            {canAdd && (
              <Button
                size="sm"
                onClick={() => setAddOpen(true)}
                data-ocid="coa.add_report_button"
              >
                <FilePlus size={14} className="mr-1.5" /> Add Report
              </Button>
            )}
          </div>
        </div>

        {/* Upcoming deadline alert */}
        {upcomingDeadlines.length > 0 && (
          <div
            className="flex items-start gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3"
            data-ocid="coa.upcoming_deadlines.section"
          >
            <Clock
              size={16}
              className="mt-0.5 flex-shrink-0 text-accent-foreground"
            />
            <div>
              <p className="text-sm font-semibold text-accent-foreground">
                {upcomingDeadlines.length} deadline
                {upcomingDeadlines.length > 1 ? "s" : ""} within the next 7 days
              </p>
              <p className="text-xs text-muted-foreground">
                Review and submit pending reports to avoid non-compliance.
              </p>
            </div>
          </div>
        )}

        {/* Overdue alert */}
        {stats.overdue > 0 && (
          <div
            className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3"
            data-ocid="coa.overdue.section"
          >
            <AlertTriangle
              size={16}
              className="mt-0.5 flex-shrink-0 text-destructive"
            />
            <div>
              <p className="text-sm font-semibold text-destructive">
                {stats.overdue} overdue report{stats.overdue > 1 ? "s" : ""}{" "}
                require immediate attention
              </p>
              <p className="text-xs text-muted-foreground">
                Submit these reports to avoid COA compliance issues.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          data-ocid="coa.stats.section"
        >
          {statCards.map((card) => (
            <Card key={card.label} className="border-border">
              <CardContent className="p-5">
                {reportsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-7 w-12" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {card.label}
                      </p>
                      <p
                        className={`mt-1 text-2xl font-bold font-display ${card.color}`}
                      >
                        {card.value}
                      </p>
                    </div>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg} ${card.color}`}
                    >
                      {card.icon}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reports table */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">
                  Report Tracking
                </CardTitle>
                {!reportsLoading && (
                  <Badge variant="secondary" className="text-xs">
                    {displayedReports.length}
                  </Badge>
                )}
              </div>
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as typeof activeTab)}
              >
                <TabsList className="h-8">
                  <TabsTrigger
                    value="all"
                    className="text-xs px-3 h-6"
                    data-ocid="coa.tab.all"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="quarterly"
                    className="text-xs px-3 h-6"
                    data-ocid="coa.tab.quarterly"
                  >
                    Quarterly
                  </TabsTrigger>
                  <TabsTrigger
                    value="annual"
                    className="text-xs px-3 h-6"
                    data-ocid="coa.tab.annual"
                  >
                    Annual
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <CoaReportTable
              reports={displayedReports}
              overdueIds={overdueIds}
              isLoading={reportsLoading}
              onUpdateStatus={handleUpdateStatus}
              onViewDocs={setSelectedReport}
              isUpdating={updateMutation.isPending}
              canEdit={canEdit}
            />
          </CardContent>
        </Card>

        {/* Dialogs */}
        <CoaReportForm
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSubmit={(data) => addMutation.mutate(data)}
          isLoading={addMutation.isPending}
        />

        <SupportingDocsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      </div>
    </AppLayout>
  );
}
