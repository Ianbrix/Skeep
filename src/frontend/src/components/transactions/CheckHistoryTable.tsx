import type { TransactionPublic } from "@/backend";
import { CheckStatus, PaymentMethod, Role } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { CheckSquare } from "lucide-react";

const PESO = (n: bigint | number) =>
  `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const checkStatusConfig: Record<
  CheckStatus,
  { label: string; className: string }
> = {
  [CheckStatus.pendingIssuance]: {
    label: "Pending Issuance",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  [CheckStatus.issued]: {
    label: "Issued",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  [CheckStatus.cleared]: {
    label: "Cleared",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  [CheckStatus.cancelled]: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

interface CheckHistoryTableProps {
  transactions: TransactionPublic[];
  isLoading: boolean;
  onUpdateStatus: (tx: TransactionPublic, newStatus: CheckStatus) => void;
}

export function CheckHistoryTable({
  transactions,
  isLoading,
  onUpdateStatus,
}: CheckHistoryTableProps) {
  const { user } = useAuthStore();
  const isTreasurer = user?.role === Role.treasurer;

  const checkTxs = transactions.filter(
    (tx) => tx.paymentMethod === PaymentMethod.check && tx.checkDetails,
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (checkTxs.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        data-ocid="check_history.empty_state"
      >
        <CheckSquare
          size={48}
          className="mb-3 text-muted-foreground opacity-40"
        />
        <p className="text-sm font-medium text-muted-foreground">
          No check transactions found
        </p>
        <p className="text-xs text-muted-foreground">
          Check payment transactions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-semibold uppercase tracking-wider">
              Date
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">
              Payee
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">
              Bank Name
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">
              Check No.
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">
              Purpose
            </TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
              Amount
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">
              Status
            </TableHead>
            {isTreasurer && (
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Update Status
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {checkTxs.map((tx, idx) => {
            const cd = tx.checkDetails;
            if (!cd) return null;
            const status = cd.status as CheckStatus;
            const cfg = checkStatusConfig[status];
            const checkDateMs = Number(cd.checkDate) / 1_000_000;
            const dateStr = new Date(checkDateMs).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <TableRow
                key={String(tx.id)}
                className="hover:bg-muted/30 transition-colors"
                data-ocid={`check_history.item.${idx + 1}`}
              >
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {dateStr}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {cd.payee}
                </TableCell>
                <TableCell className="text-sm">{cd.bankName}</TableCell>
                <TableCell className="text-sm font-mono">
                  {cd.checkNumber ?? (
                    <span className="text-muted-foreground italic">—</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[160px]">
                  <p className="truncate text-sm">{cd.purpose}</p>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-bold tabular-nums text-destructive">
                    -{PESO(tx.amount)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold ${cfg?.className ?? ""}`}
                  >
                    {cfg?.label ?? status}
                  </Badge>
                </TableCell>
                {isTreasurer && (
                  <TableCell>
                    <Select
                      value={status}
                      onValueChange={(val) =>
                        onUpdateStatus(tx, val as CheckStatus)
                      }
                    >
                      <SelectTrigger
                        className="h-8 w-40 text-xs"
                        data-ocid={`check_history.status_select.${idx + 1}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CheckStatus.pendingIssuance}>
                          Pending Issuance
                        </SelectItem>
                        <SelectItem value={CheckStatus.issued}>
                          Issued
                        </SelectItem>
                        <SelectItem value={CheckStatus.cleared}>
                          Cleared
                        </SelectItem>
                        <SelectItem value={CheckStatus.cancelled}>
                          Cancelled
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
