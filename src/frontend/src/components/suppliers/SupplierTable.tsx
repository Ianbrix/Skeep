import type { Purchase, SupplierPublic } from "@/backend";
import { createActor } from "@/backend";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Edit2, ExternalLink, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";

const PESO = (n: bigint | number) =>
  `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const fmtDate = (ts: bigint) =>
  new Date(Number(ts) / 1_000_000).toLocaleDateString("en-PH");

interface SupplierTableProps {
  suppliers: SupplierPublic[];
  isLoading: boolean;
  isTreasurer: boolean;
  onEdit: (s: SupplierPublic) => void;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
}

function PurchaseHistoryDialog({
  supplier,
  open,
  onClose,
}: {
  supplier: SupplierPublic | null;
  open: boolean;
  onClose: () => void;
}) {
  const { actor, isFetching } = useActor(createActor);
  const { data: purchases = [], isLoading } = useQuery<Purchase[]>({
    queryKey: ["purchases", supplier?.id?.toString()],
    queryFn: async () => {
      if (!actor || !supplier) return [];
      return actor.getPurchasesBySupplier(supplier.id);
    },
    enabled: !!actor && !isFetching && !!supplier && open,
  });

  const totalAmount = purchases.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-lg"
        data-ocid="supplier.history.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-base">
            <span className="text-muted-foreground">Purchase History —</span>{" "}
            {supplier?.name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : purchases.length === 0 ? (
          <div
            className="py-10 text-center text-sm text-muted-foreground"
            data-ocid="supplier.history.empty_state"
          >
            <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
            No purchases recorded for this supplier.
          </div>
        ) : (
          <>
            <div className="divide-y divide-border max-h-80 overflow-y-auto">
              {purchases.map((p, i) => (
                <div
                  key={String(p.purchaseId)}
                  className="flex items-center gap-3 py-3"
                  data-ocid={`supplier.history.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">
                      {p.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Txn #{String(p.transactionId)} · {fmtDate(p.date)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {PESO(p.amount)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2.5 mt-2">
              <span className="text-sm font-semibold text-muted-foreground">
                Total Purchases
              </span>
              <span className="text-base font-bold text-primary">
                {PESO(totalAmount)}
              </span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function SupplierTable({
  suppliers,
  isLoading,
  isTreasurer,
  onEdit,
  onDelete,
  isDeleting,
}: SupplierTableProps) {
  const [historySupplier, setHistorySupplier] = useState<SupplierPublic | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<SupplierPublic | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="suppliers.loading_state">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        data-ocid="suppliers.empty_state"
      >
        <ShoppingBag size={40} className="mb-3 text-muted-foreground/40" />
        <p className="text-sm font-semibold text-foreground">
          No Suppliers Found
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isTreasurer
            ? 'Click "Add Supplier" to register your first supplier.'
            : "No suppliers have been registered yet."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Supplier Name
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                TIN
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                VAT Status
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Contact Person
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Phone
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {suppliers.map((s, i) => (
              <tr
                key={String(s.id)}
                className="hover:bg-muted/20 transition-colors"
                data-ocid={`suppliers.item.${i + 1}`}
              >
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="font-medium text-primary hover:underline flex items-center gap-1 min-w-0"
                    onClick={() => setHistorySupplier(s)}
                    data-ocid={`suppliers.history_button.${i + 1}`}
                  >
                    <span className="truncate max-w-[160px]">{s.name}</span>
                    <ExternalLink size={12} className="shrink-0" />
                  </button>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {s.address}
                  </p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{s.tin}</td>
                <td className="px-4 py-3">
                  {s.isVatRegistered ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 text-xs">
                      VAT-Registered
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Non-VAT
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-foreground">{s.contactPerson}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                  {s.phone}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {isTreasurer && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEdit(s)}
                          data-ocid={`suppliers.edit_button.${i + 1}`}
                          title="Edit supplier"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(s)}
                          data-ocid={`suppliers.delete_button.${i + 1}`}
                          title="Delete supplier"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PurchaseHistoryDialog
        supplier={historySupplier}
        open={!!historySupplier}
        onClose={() => setHistorySupplier(null)}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent data-ocid="supplier.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="supplier.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={() => {
                if (deleteTarget) {
                  onDelete(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
              data-ocid="supplier.delete.confirm_button"
            >
              {isDeleting ? "Deleting..." : "Delete Supplier"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
