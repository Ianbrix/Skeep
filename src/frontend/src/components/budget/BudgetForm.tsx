import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface BudgetFormProps {
  mode: "budget" | "allocation";
  defaultTotalBudget?: number;
  defaultFiscalYear?: number;
  defaultName?: string;
  defaultAmount?: number;
  onSubmit: (values: {
    totalBudget: number;
    fiscalYear: number;
    name: string;
    amount: number;
  }) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function BudgetForm({
  mode,
  defaultTotalBudget = 0,
  defaultFiscalYear = new Date().getFullYear(),
  defaultName = "",
  defaultAmount = 0,
  onSubmit,
  isLoading,
  onCancel,
}: BudgetFormProps) {
  const [totalBudget, setTotalBudget] = useState<string>(
    defaultTotalBudget > 0 ? String(defaultTotalBudget) : "",
  );
  const [fiscalYear, setFiscalYear] = useState<string>(
    String(defaultFiscalYear),
  );
  const [name, setName] = useState<string>(defaultName);
  const [amount, setAmount] = useState<string>(
    defaultAmount > 0 ? String(defaultAmount) : "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (mode === "budget") {
      const tb = Number.parseFloat(totalBudget);
      if (!totalBudget || Number.isNaN(tb) || tb <= 0)
        errs.totalBudget = "Enter a valid amount greater than 0.";
      const fy = Number.parseInt(fiscalYear, 10);
      if (!fiscalYear || Number.isNaN(fy) || fy < 2000 || fy > 2100)
        errs.fiscalYear = "Enter a valid fiscal year (2000–2100).";
    } else {
      if (!name.trim()) errs.name = "Program name is required.";
      const amt = Number.parseFloat(amount);
      if (!amount || Number.isNaN(amt) || amt <= 0)
        errs.amount = "Enter a valid amount greater than 0.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      totalBudget: Number.parseFloat(totalBudget) || 0,
      fiscalYear: Number.parseInt(fiscalYear, 10) || new Date().getFullYear(),
      name: name.trim(),
      amount: Number.parseFloat(amount) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {mode === "budget" ? (
        <>
          <div className="space-y-1">
            <Label htmlFor="totalBudget">Total Annual Budget (₱)</Label>
            <Input
              id="totalBudget"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 500000.00"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              data-ocid="budget.form.total_budget_input"
            />
            {errors.totalBudget && (
              <p
                className="text-xs text-destructive"
                data-ocid="budget.form.total_budget.field_error"
              >
                {errors.totalBudget}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="fiscalYear">Fiscal Year</Label>
            <Input
              id="fiscalYear"
              type="number"
              min="2000"
              max="2100"
              placeholder={String(new Date().getFullYear())}
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              data-ocid="budget.form.fiscal_year_input"
            />
            {errors.fiscalYear && (
              <p
                className="text-xs text-destructive"
                data-ocid="budget.form.fiscal_year.field_error"
              >
                {errors.fiscalYear}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="space-y-1">
            <Label htmlFor="programName">Program Name</Label>
            <Input
              id="programName"
              type="text"
              placeholder="e.g. Youth Development Program"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="budget.form.program_name_input"
            />
            {errors.name && (
              <p
                className="text-xs text-destructive"
                data-ocid="budget.form.program_name.field_error"
              >
                {errors.name}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="allocAmount">Allocated Amount (₱)</Label>
            <Input
              id="allocAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 50000.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-ocid="budget.form.alloc_amount_input"
            />
            {errors.amount && (
              <p
                className="text-xs text-destructive"
                data-ocid="budget.form.alloc_amount.field_error"
              >
                {errors.amount}
              </p>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          data-ocid="budget.form.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          data-ocid="budget.form.submit_button"
        >
          {isLoading
            ? "Saving…"
            : mode === "budget"
              ? "Save Budget"
              : "Save Program"}
        </Button>
      </div>
    </form>
  );
}
