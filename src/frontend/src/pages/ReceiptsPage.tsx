import { createActor } from "@/backend";
import type { Document, ProjectPublic, TransactionPublic } from "@/backend";
import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentTable } from "@/components/receipts/DocumentTable";
import { UploadReceiptForm } from "@/components/receipts/UploadReceiptForm";
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
import { useAuthStore } from "@/store/authStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Filter, Plus, RefreshCw, Upload, X } from "lucide-react";
import { useState } from "react";

export function ReceiptsPage() {
  const { user } = useAuthStore();
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();

  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTxId, setFilterTxId] = useState<string>("all");
  const [filterProjId, setFilterProjId] = useState<string>("all");

  const { data: documents = [], isLoading: docsLoading } = useQuery<Document[]>(
    {
      queryKey: ["documents"],
      queryFn: async () => (actor ? actor.getDocuments() : []),
      enabled: !!actor && !isFetching,
    },
  );

  const { data: transactions = [] } = useQuery<TransactionPublic[]>({
    queryKey: ["transactions"],
    queryFn: async () => (actor ? actor.getTransactions(null) : []),
    enabled: !!actor && !isFetching,
  });

  const { data: projects = [] } = useQuery<ProjectPublic[]>({
    queryKey: ["projects"],
    queryFn: async () => (actor ? actor.getProjects() : []),
    enabled: !!actor && !isFetching,
  });

  const getFileCategory = (fileType: string): "image" | "pdf" | "other" => {
    const lower = fileType.toLowerCase();
    if (
      lower.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(lower)
    )
      return "image";
    if (lower === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
    return "other";
  };

  const filtered = documents.filter((doc) => {
    const matchSearch =
      !search || doc.fileName.toLowerCase().includes(search.toLowerCase());
    const matchType =
      filterType === "all" || getFileCategory(doc.fileType) === filterType;
    const matchTx =
      filterTxId === "all" ||
      doc.linkedTransactionId?.toString() === filterTxId;
    const matchProj =
      filterProjId === "all" ||
      doc.linkedProjectId?.toString() === filterProjId;
    return matchSearch && matchType && matchTx && matchProj;
  });

  const hasFilters =
    search ||
    filterType !== "all" ||
    filterTxId !== "all" ||
    filterProjId !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilterType("all");
    setFilterTxId("all");
    setFilterProjId("all");
  };

  return (
    <AppLayout>
      <div className="space-y-6" data-ocid="receipts.page">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Receipts &amp; Documents
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage uploaded receipts, disbursement vouchers, and supporting
              documents.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => qc.invalidateQueries({ queryKey: ["documents"] })}
              data-ocid="receipts.refresh_button"
            >
              <RefreshCw size={14} className="mr-1.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setShowUpload(true)}
              data-ocid="receipts.upload_button"
              className="gap-1.5"
            >
              <Upload size={14} />
              Upload Receipt
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Total Files",
              value: documents.length,
              color: "text-primary",
            },
            {
              label: "Images",
              value: documents.filter(
                (d) => getFileCategory(d.fileType) === "image",
              ).length,
              color: "text-primary",
            },
            {
              label: "PDFs",
              value: documents.filter(
                (d) => getFileCategory(d.fileType) === "pdf",
              ).length,
              color: "text-destructive",
            },
            {
              label: "Other Files",
              value: documents.filter(
                (d) => getFileCategory(d.fileType) === "other",
              ).length,
              color: "text-muted-foreground",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className={`text-xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          className="rounded-lg border border-border bg-card p-4"
          data-ocid="receipts.filters.panel"
        >
          <div className="mb-3 flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Filter Documents
            </span>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto h-7 px-2 text-xs"
                data-ocid="receipts.clear_filters_button"
              >
                <X size={12} className="mr-1" />
                Clear
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Search by file name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="receipts.search_input"
              className="text-sm"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger data-ocid="receipts.filter_type.select">
                <SelectValue placeholder="File type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="pdf">PDFs</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTxId} onValueChange={setFilterTxId}>
              <SelectTrigger data-ocid="receipts.filter_transaction.select">
                <SelectValue placeholder="Transaction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                {transactions.map((tx) => (
                  <SelectItem key={tx.id.toString()} value={tx.id.toString()}>
                    #{tx.id.toString()} — {tx.description.slice(0, 30)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterProjId} onValueChange={setFilterProjId}>
              <SelectTrigger data-ocid="receipts.filter_project.select">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id.toString()} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {docsLoading ? (
          <div className="space-y-3" data-ocid="receipts.loading_state">
            {["s1", "s2", "s3", "s4", "s5"].map((k) => (
              <Skeleton key={k} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <DocumentTable
            documents={filtered}
            transactions={transactions}
            projects={projects}
            userRole={user?.role}
            onDeleted={() => qc.invalidateQueries({ queryKey: ["documents"] })}
          />
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadReceiptForm
          transactions={transactions}
          projects={projects}
          userId={user?.id ?? 0n}
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false);
            qc.invalidateQueries({ queryKey: ["documents"] });
          }}
        />
      )}
    </AppLayout>
  );
}
