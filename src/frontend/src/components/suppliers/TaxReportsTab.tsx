import type { Purchase, SupplierPublic } from "@/backend";
import { createActor } from "@/backend";
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
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Download, Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PESO = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const VAT_RATE = 0.12;
const WHT_RATE = 0.02;

const FISCAL_YEARS = Array.from({ length: 5 }, (_, i) =>
  String(new Date().getFullYear() - i),
);

interface TaxRow {
  supplier: SupplierPublic;
  totalPurchases: number;
  vatAmount: number;
  whtAmount: number;
}

function usePurchasesForAll(suppliers: SupplierPublic[]) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Purchase[]>({
    queryKey: [
      "purchases",
      "all",
      suppliers.map((s) => String(s.id)).join(","),
    ],
    queryFn: async () => {
      if (!actor || suppliers.length === 0) return [];
      const results: Purchase[] = [];
      for (const s of suppliers) {
        const ps = await actor.getPurchasesBySupplier(s.id);
        for (const p of ps) results.push(p);
      }
      return results;
    },
    enabled: !!actor && !isFetching && suppliers.length > 0,
  });
}

export function TaxReportsTab({
  suppliers,
  isLoading,
}: { suppliers: SupplierPublic[]; isLoading: boolean }) {
  const [fiscalYear, setFiscalYear] = useState(
    String(new Date().getFullYear()),
  );
  const { data: allPurchases = [], isLoading: purchasesLoading } =
    usePurchasesForAll(suppliers);

  const taxRows: TaxRow[] = suppliers
    .map((s) => {
      const sps = allPurchases.filter(
        (p) => String(p.supplierId) === String(s.id),
      );
      const total = sps.reduce((sum, p) => sum + Number(p.amount), 0);
      return {
        supplier: s,
        totalPurchases: total,
        vatAmount: s.isVatRegistered ? total * VAT_RATE : 0,
        whtAmount: total * WHT_RATE,
      };
    })
    .filter((r) => r.totalPurchases > 0)
    .sort((a, b) => b.totalPurchases - a.totalPurchases);

  const grandTotal = taxRows.reduce((s, r) => s + r.totalPurchases, 0);
  const grandVat = taxRows.reduce((s, r) => s + r.vatAmount, 0);
  const grandWht = taxRows.reduce((s, r) => s + r.whtAmount, 0);

  const loading = isLoading || purchasesLoading;

  return (
    <div className="space-y-4" data-ocid="tax.section">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">
            VAT & Withholding Tax Summary
          </h3>
          <p className="text-xs text-muted-foreground">
            12% VAT for registered suppliers · 2% withholding tax on all
            purchases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={fiscalYear} onValueChange={setFiscalYear}>
            <SelectTrigger
              className="w-36 h-8 text-xs"
              data-ocid="tax.year.select"
            >
              <SelectValue placeholder="Fiscal Year" />
            </SelectTrigger>
            <SelectContent>
              {FISCAL_YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  FY {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={() =>
              toast.info("Feature coming soon", {
                description:
                  "Export to Excel/PDF will be available in a future update.",
              })
            }
            data-ocid="tax.export_button"
          >
            <Download size={13} />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2" data-ocid="tax.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : taxRows.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="tax.empty_state"
        >
          <Receipt size={40} className="mb-3 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-foreground">
            No Tax Data Available
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Add suppliers and record purchases to generate tax reports.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Supplier
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Total Purchases
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    VAT (12%)
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Withholding Tax (2%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {taxRows.map((row, i) => (
                  <tr
                    key={String(row.supplier.id)}
                    className="hover:bg-muted/20 transition-colors"
                    data-ocid={`tax.item.${i + 1}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {row.supplier.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {row.supplier.tin}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {row.supplier.isVatRegistered ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 text-xs">
                          VAT-Registered
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Non-VAT
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {PESO(row.totalPurchases)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {row.vatAmount > 0 ? (
                        <span className="text-primary font-medium">
                          {PESO(row.vatAmount)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-destructive tabular-nums">
                      {PESO(row.whtAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/40 border-t-2 border-border font-semibold">
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    Grand Total
                  </td>
                  <td className="px-4 py-3 text-right text-foreground tabular-nums">
                    {PESO(grandTotal)}
                  </td>
                  <td className="px-4 py-3 text-right text-primary tabular-nums">
                    {PESO(grandVat)}
                  </td>
                  <td className="px-4 py-3 text-right text-destructive tabular-nums">
                    {PESO(grandWht)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Total Purchases",
                value: PESO(grandTotal),
                color: "text-foreground",
                bg: "bg-muted/30",
              },
              {
                label: "Total VAT (12%)",
                value: PESO(grandVat),
                color: "text-primary",
                bg: "bg-primary/5",
              },
              {
                label: "Total Withholding Tax (2%)",
                value: PESO(grandWht),
                color: "text-destructive",
                bg: "bg-destructive/5",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-lg border border-border px-4 py-3 ${stat.bg}`}
              >
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p
                  className={`mt-0.5 text-lg font-bold font-display ${stat.color}`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
