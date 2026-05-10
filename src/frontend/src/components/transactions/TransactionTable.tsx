import type { TransactionPublic } from "@/backend";
import { PaymentMethod, Role, TransactionType } from "@/backend";
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
import { useAuthStore } from "@/store/authStore";
import { Edit, Receipt, Trash2 } from "lucide-react";

const PESO = (n: bigint | number) =>
  `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const txTypeConfig: Record<
  TransactionType,
  { label: string; className: string }
> = {
  [TransactionType.income]: {
    label: "Income",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  [TransactionType.expenses]: {
    label: "Expenses",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  [TransactionType.cashAdvance]: {
    label: "Cash Advance",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  [TransactionType.reimbursement]: {
    label: "Reimbursement",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  [TransactionType.projectExpenses]: {
    label: "Project Expenses",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

const pmLabel: Record<PaymentMethod, string> = {
  [PaymentMethod.cash]: "Cash",
  [PaymentMethod.gcash]: "GCash",
  [PaymentMethod.bankTransfer]: "Bank Transfer",
  [PaymentMethod.check]: "Check",
};

interface TransactionTableProps {
  transactions: TransactionPublic[];
  isLoading: boolean;
  onEdit: (tx: TransactionPublic) => void;
  onDelete: (tx: TransactionPublic) => void;
}

export function TransactionTable({
  transactions,
  isLoading,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const { user } = useAuthStore();
  const isTreasurer = user?.role === Role.treasurer;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        data-ocid="transactions.empty_state"
      >
        <Receipt size={48} className="mb-3 text-muted-foreground opacity-40" />
        <p className="text-sm font-medium text-muted-foreground">
          No transactions found
        </p>
        <p className="text-xs text-muted-foreground">
          Try adjusting your filters or add a new transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider">
              Date
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">
              Description
            </TableHead>
            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider">
              Type
            </TableHead>
            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider">
              Payment Method
            </TableHead>
            <TableHead className="whitespace-nowrap text-right text-xs font-semibold uppercase tracking-wider">
              Amount
            </TableHead>
            {isTreasurer && (
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx, idx) => {
            const cfg = txTypeConfig[tx.txType as TransactionType];
            const isIncome = tx.txType === TransactionType.income;
            const dateMs = Number(tx.date) / 1_000_000;
            const dateStr = new Date(dateMs).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <TableRow
                key={String(tx.id)}
                className="hover:bg-muted/30 transition-colors"
                data-ocid={`transactions.item.${idx + 1}`}
              >
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {dateStr}
                </TableCell>
                <TableCell className="max-w-[220px]">
                  <p className="truncate text-sm font-medium">
                    {tx.description}
                  </p>
                  {tx.checkDetails && (
                    <p className="text-xs text-muted-foreground">
                      Check #{tx.checkDetails.checkNumber ?? "—"} ·{" "}
                      {tx.checkDetails.payee}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold ${cfg?.className ?? ""}`}
                  >
                    {cfg?.label ?? tx.txType}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {pmLabel[tx.paymentMethod as PaymentMethod] ??
                    tx.paymentMethod}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      isIncome ? "text-green-600" : "text-destructive"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {PESO(tx.amount)}
                  </span>
                </TableCell>
                {isTreasurer && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                        onClick={() => onEdit(tx)}
                        data-ocid={`transactions.edit_button.${idx + 1}`}
                        aria-label="Edit transaction"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(tx)}
                        data-ocid={`transactions.delete_button.${idx + 1}`}
                        aria-label="Delete transaction"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
