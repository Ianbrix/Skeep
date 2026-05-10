import type { AllocationPublic } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Edit2, Trash2 } from "lucide-react";

interface AllocationTableProps {
  allocations: AllocationPublic[];
  isLoading: boolean;
  isTreasurer: boolean;
  editTarget: AllocationPublic | null;
  onEditRequest: (a: AllocationPublic) => void;
  onDelete: (id: bigint) => void;
  onEditSubmit: (v: { id: bigint; name: string; amount: number }) => void;
  onEditCancel: () => void;
  isDeleting: boolean;
  isUpdating: boolean;
}

const peso = (n: number | bigint) =>
  `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

function UtilizationBadge({ pct }: { pct: number }) {
  if (pct > 100)
    return (
      <Badge variant="destructive" className="gap-1 text-xs">
        <AlertTriangle size={10} /> {pct.toFixed(1)}%
      </Badge>
    );
  if (pct > 80)
    return (
      <Badge className="bg-accent text-accent-foreground text-xs">
        {pct.toFixed(1)}%
      </Badge>
    );
  return (
    <Badge variant="secondary" className="text-xs">
      {pct.toFixed(1)}%
    </Badge>
  );
}

export function AllocationTable({
  allocations,
  isLoading,
  isTreasurer,
  onEditRequest,
  onDelete,
  isDeleting,
}: AllocationTableProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 py-12 text-center"
        data-ocid="budget.allocations.empty_state"
      >
        <p className="text-sm font-medium text-muted-foreground">
          No program allocations yet.
        </p>
        {isTreasurer && (
          <p className="text-xs text-muted-foreground">
            Click &ldquo;Add Program&rdquo; to create your first allocation.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-ocid="budget.allocations.table">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Program Name
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Allocated
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Spent
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Utilization
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Remaining
            </th>
            {isTreasurer && (
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {allocations.map((a, idx) => {
            const allocated = Number(a.allocatedAmount);
            const spent = Number(a.spentAmount);
            const remaining = allocated - spent;
            const pct = allocated > 0 ? (spent / allocated) * 100 : 0;
            const isOver = spent > allocated;

            return (
              <tr
                key={String(a.id)}
                className={`border-b border-border transition-colors hover:bg-muted/20 ${
                  isOver ? "bg-destructive/5" : ""
                }`}
                data-ocid={`budget.allocation.item.${idx + 1}`}
              >
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    {isOver && (
                      <AlertTriangle
                        size={14}
                        className="text-destructive shrink-0"
                      />
                    )}
                    <span className="truncate max-w-[180px]" title={a.name}>
                      {a.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">
                  {peso(allocated / 100)}
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums font-medium ${
                    isOver ? "text-destructive" : ""
                  }`}
                >
                  {peso(spent / 100)}
                </td>
                <td className="px-4 py-3 text-right">
                  <UtilizationBadge pct={pct} />
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums font-semibold ${
                    remaining < 0 ? "text-destructive" : "text-primary"
                  }`}
                >
                  {remaining < 0 && "-"}
                  {peso(Math.abs(remaining) / 100)}
                </td>
                {isTreasurer && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onEditRequest(a)}
                        data-ocid={`budget.allocation.edit_button.${idx + 1}`}
                      >
                        <Edit2 size={13} />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            data-ocid={`budget.allocation.delete_button.${idx + 1}`}
                            disabled={isDeleting}
                          >
                            <Trash2 size={13} />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="budget.allocation.delete_dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Allocation
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &ldquo;{a.name}
                              &rdquo;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="budget.allocation.delete_cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => onDelete(a.id)}
                              data-ocid="budget.allocation.delete_confirm_button"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
