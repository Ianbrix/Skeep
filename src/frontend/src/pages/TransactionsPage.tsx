import { createActor } from "@/backend";
import type {
  AddTransactionInput,
  ProjectPublic,
  SupplierPublic,
  TransactionPublic,
} from "@/backend";
import {
  type CheckStatus,
  PaymentMethod,
  Role,
  TransactionType,
} from "@/backend";
import { AppLayout } from "@/components/layout/AppLayout";
import { CheckHistoryTable } from "@/components/transactions/CheckHistoryTable";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckSquare,
  Filter,
  Plus,
  ReceiptText,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PESO = (n: bigint | number) =>
  `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

export function TransactionsPage() {
  const { user } = useAuthStore();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const isTreasurer = user?.role === Role.treasurer;

  // Filter state
  const [filterType, setFilterType] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Dialog / modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionPublic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransactionPublic | null>(
    null,
  );

  // Data queries
  const {
    data: transactions = [],
    isLoading: txLoading,
    refetch: refetchTx,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => (actor ? actor.getTransactions(null) : []),
    enabled: !!actor && !isFetching,
  });

  const { data: projects = [] } = useQuery<ProjectPublic[]>({
    queryKey: ["projects"],
    queryFn: async () => (actor ? actor.getProjects() : []),
    enabled: !!actor && !isFetching,
  });

  const { data: suppliers = [] } = useQuery<SupplierPublic[]>({
    queryKey: ["suppliers"],
    queryFn: async () => (actor ? actor.getSuppliers() : []),
    enabled: !!actor && !isFetching,
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (input: AddTransactionInput) => {
      if (!actor || !user) throw new Error("Not authenticated");
      return actor.addTransaction(input, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setFormOpen(false);
      toast.success("Transaction added successfully");
    },
    onError: () => toast.error("Failed to add transaction"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: bigint;
      input: AddTransactionInput;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateTransaction(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setFormOpen(false);
      setEditing(null);
      toast.success("Transaction updated successfully");
    },
    onError: () => toast.error("Failed to update transaction"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteTransaction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setDeleteTarget(null);
      toast.success("Transaction deleted");
    },
    onError: () => toast.error("Failed to delete transaction"),
  });

  function handleFormSubmit(input: AddTransactionInput) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, input });
    } else {
      addMutation.mutate(input);
    }
  }

  function handleEdit(tx: TransactionPublic) {
    setEditing(tx);
    setFormOpen(true);
  }

  function handleOpenAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleUpdateCheckStatus(
    tx: TransactionPublic,
    newStatus: CheckStatus,
  ) {
    if (!tx.checkDetails) return;
    const input: AddTransactionInput = {
      date: tx.date,
      description: tx.description,
      txType: tx.txType,
      amount: tx.amount,
      paymentMethod: tx.paymentMethod,
      projectId: tx.projectId,
      supplierId: tx.supplierId,
      receiptId: tx.receiptId,
      checkDetails: { ...tx.checkDetails, status: newStatus },
    };
    updateMutation.mutate({ id: tx.id, input });
  }

  // Client-side filtering
  const filtered = transactions.filter((tx) => {
    if (filterType && tx.txType !== filterType) return false;
    if (filterMethod && tx.paymentMethod !== filterMethod) return false;
    if (filterFrom) {
      const fromTs = new Date(filterFrom).getTime() * 1_000_000;
      if (Number(tx.date) < fromTs) return false;
    }
    if (filterTo) {
      const toTs = (new Date(filterTo).getTime() + 86400000) * 1_000_000;
      if (Number(tx.date) > toTs) return false;
    }
    return true;
  });

  // Summary stats
  const totalIncome = filtered
    .filter((t) => t.txType === TransactionType.income)
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = filtered
    .filter((t) => t.txType !== TransactionType.income)
    .reduce((s, t) => s + Number(t.amount), 0);

  function clearFilters() {
    setFilterType("");
    setFilterMethod("");
    setFilterFrom("");
    setFilterTo("");
  }

  const hasFilter = filterType || filterMethod || filterFrom || filterTo;

  return (
    <AppLayout>
      <div className="space-y-5" data-ocid="transactions.page">
        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Transaction Records
            </h2>
            <p className="text-sm text-muted-foreground">
              Record and manage all SK financial transactions
            </p>
          </div>
          {isTreasurer && (
            <Button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              onClick={handleOpenAdd}
              data-ocid="transactions.add_button"
            >
              <Plus size={16} />
              Add Transaction
            </Button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                  <ArrowUpCircle size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Total Income
                  </p>
                  <p className="text-base font-bold text-green-600">
                    {PESO(totalIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
                  <ArrowDownCircle size={18} className="text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Total Expenses
                  </p>
                  <p className="text-base font-bold text-destructive">
                    {PESO(totalExpenses)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <ReceiptText size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Transactions
                  </p>
                  <p className="text-base font-bold text-foreground">
                    {filtered.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter bar */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-3">
              <Filter
                size={16}
                className="mb-1 text-muted-foreground shrink-0"
              />
              <div className="space-y-1 min-w-[140px]">
                <Label className="text-xs font-semibold">Type</Label>
                <Select
                  value={filterType || "all"}
                  onValueChange={(v) => setFilterType(v === "all" ? "" : v)}
                >
                  <SelectTrigger
                    className="h-8 text-sm"
                    data-ocid="transactions.filter_type_select"
                  >
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value={TransactionType.income}>
                      Income
                    </SelectItem>
                    <SelectItem value={TransactionType.expenses}>
                      Expenses
                    </SelectItem>
                    <SelectItem value={TransactionType.cashAdvance}>
                      Cash Advance
                    </SelectItem>
                    <SelectItem value={TransactionType.reimbursement}>
                      Reimbursement
                    </SelectItem>
                    <SelectItem value={TransactionType.projectExpenses}>
                      Project Expenses
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 min-w-[140px]">
                <Label className="text-xs font-semibold">Payment Method</Label>
                <Select
                  value={filterMethod || "all"}
                  onValueChange={(v) => setFilterMethod(v === "all" ? "" : v)}
                >
                  <SelectTrigger
                    className="h-8 text-sm"
                    data-ocid="transactions.filter_method_select"
                  >
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value={PaymentMethod.cash}>Cash</SelectItem>
                    <SelectItem value={PaymentMethod.gcash}>GCash</SelectItem>
                    <SelectItem value={PaymentMethod.bankTransfer}>
                      Bank Transfer
                    </SelectItem>
                    <SelectItem value={PaymentMethod.check}>Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">From</Label>
                <Input
                  type="date"
                  className="h-8 text-sm w-36"
                  value={filterFrom}
                  onChange={(e) => setFilterFrom(e.target.value)}
                  data-ocid="transactions.filter_from_input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">To</Label>
                <Input
                  type="date"
                  className="h-8 text-sm w-36"
                  value={filterTo}
                  onChange={(e) => setFilterTo(e.target.value)}
                  data-ocid="transactions.filter_to_input"
                />
              </div>
              {hasFilter && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground"
                  onClick={clearFilters}
                  data-ocid="transactions.clear_filters_button"
                >
                  Clear filters
                </Button>
              )}
              {hasFilter && (
                <Badge variant="secondary" className="text-xs">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs: All | Check History */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList
            className="border-b bg-muted/40 w-full justify-start rounded-none h-auto p-0 gap-0"
            data-ocid="transactions.tabs"
          >
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent px-5 py-2.5 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent"
              data-ocid="transactions.tab.all"
            >
              <ReceiptText size={15} className="mr-1.5" />
              All Transactions
              <Badge variant="secondary" className="ml-2 text-xs">
                {filtered.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="checks"
              className="rounded-none border-b-2 border-transparent px-5 py-2.5 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent"
              data-ocid="transactions.tab.checks"
            >
              <CheckSquare size={15} className="mr-1.5" />
              Check Transactions
              <Badge variant="secondary" className="ml-2 text-xs">
                {
                  filtered.filter(
                    (t) => t.paymentMethod === PaymentMethod.check,
                  ).length
                }
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <Card className="border-t-0 rounded-tl-none">
              <CardContent className="p-0">
                <TransactionTable
                  transactions={filtered}
                  isLoading={txLoading}
                  onEdit={handleEdit}
                  onDelete={(tx) => setDeleteTarget(tx)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checks" className="mt-0">
            <Card className="border-t-0 rounded-tl-none">
              <CardContent className="p-0">
                <CheckHistoryTable
                  transactions={filtered}
                  isLoading={txLoading}
                  onUpdateStatus={handleUpdateCheckStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit form dialog */}
        <TransactionForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditing(null);
          }}
          onSubmit={handleFormSubmit}
          isSubmitting={addMutation.isPending || updateMutation.isPending}
          editing={editing}
          projects={projects}
          suppliers={suppliers}
        />

        {/* Delete confirmation dialog */}
        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <AlertDialogContent data-ocid="transactions.delete_dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &quot;{deleteTarget?.description}
                &quot;. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-ocid="transactions.delete_dialog.cancel_button"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-ocid="transactions.delete_dialog.confirm_button"
                onClick={() =>
                  deleteTarget && deleteMutation.mutate(deleteTarget.id)
                }
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting…" : "Yes, Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Refetch trigger on mount — avoids stale data when navigating back */}
      <button
        type="button"
        className="sr-only"
        aria-hidden
        onClick={() => refetchTx()}
      />
    </AppLayout>
  );
}
