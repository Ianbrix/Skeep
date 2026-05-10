import type {
  AddTransactionInput,
  ProjectPublic,
  SupplierPublic,
  TransactionPublic,
} from "@/backend";
import { CheckStatus, PaymentMethod, TransactionType } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: AddTransactionInput) => void;
  isSubmitting: boolean;
  editing?: TransactionPublic | null;
  projects: ProjectPublic[];
  suppliers: SupplierPublic[];
}

function toDateInputValue(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toISOString().split("T")[0];
}

function toTimestamp(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

export function TransactionForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  editing,
  projects,
  suppliers,
}: TransactionFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");
  const [txType, setTxType] = useState<TransactionType>(TransactionType.income);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.cash,
  );
  const [projectId, setProjectId] = useState("");
  const [supplierId, setSupplierId] = useState("");

  // Check details
  const [checkPayee, setCheckPayee] = useState("");
  const [checkBankName, setCheckBankName] = useState("");
  const [checkDate, setCheckDate] = useState(today);
  const [checkNumber, setCheckNumber] = useState("");
  const [checkPurpose, setCheckPurpose] = useState("");
  const [checkStatus, setCheckStatus] = useState<CheckStatus>(
    CheckStatus.pendingIssuance,
  );

  const isCheck = paymentMethod === PaymentMethod.check;

  useEffect(() => {
    if (open && editing) {
      setDate(toDateInputValue(editing.date));
      setDescription(editing.description);
      setTxType(editing.txType as TransactionType);
      setAmount(String(Number(editing.amount)));
      setPaymentMethod(editing.paymentMethod as PaymentMethod);
      setProjectId(editing.projectId ? String(editing.projectId) : "");
      setSupplierId(editing.supplierId ? String(editing.supplierId) : "");
      if (editing.checkDetails) {
        const cd = editing.checkDetails;
        setCheckPayee(cd.payee);
        setCheckBankName(cd.bankName);
        setCheckDate(toDateInputValue(cd.checkDate));
        setCheckNumber(cd.checkNumber ?? "");
        setCheckPurpose(cd.purpose);
        setCheckStatus(cd.status as CheckStatus);
      }
    } else if (open && !editing) {
      setDate(today);
      setDescription("");
      setTxType(TransactionType.income);
      setAmount("");
      setPaymentMethod(PaymentMethod.cash);
      setProjectId("");
      setSupplierId("");
      setCheckPayee("");
      setCheckBankName("");
      setCheckDate(today);
      setCheckNumber("");
      setCheckPurpose("");
      setCheckStatus(CheckStatus.pendingIssuance);
    }
  }, [open, editing, today]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: AddTransactionInput = {
      date: toTimestamp(date),
      description: description.trim(),
      txType,
      amount: BigInt(Math.round(Number.parseFloat(amount) * 100)),
      paymentMethod,
      projectId: projectId ? BigInt(projectId) : undefined,
      supplierId: supplierId ? BigInt(supplierId) : undefined,
      checkDetails: isCheck
        ? {
            payee: checkPayee.trim(),
            bankName: checkBankName.trim(),
            checkDate: toTimestamp(checkDate),
            checkNumber: checkNumber.trim() || undefined,
            purpose: checkPurpose.trim(),
            status: checkStatus,
          }
        : undefined,
    };
    onSubmit(input);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="transaction_form.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">
            {editing ? "Edit Transaction" : "Add New Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date + Type row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="tx-date" className="text-xs font-semibold">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                data-ocid="transaction_form.date_input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tx-type" className="text-xs font-semibold">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={txType}
                onValueChange={(v) => setTxType(v as TransactionType)}
              >
                <SelectTrigger
                  id="tx-type"
                  data-ocid="transaction_form.type_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TransactionType.income}>Income</SelectItem>
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
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="tx-desc" className="text-xs font-semibold">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="tx-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the transaction"
              rows={2}
              required
              data-ocid="transaction_form.description_input"
            />
          </div>

          {/* Amount + Payment Method row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="tx-amount" className="text-xs font-semibold">
                Amount (₱) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tx-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                data-ocid="transaction_form.amount_input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tx-pm" className="text-xs font-semibold">
                Payment Method <span className="text-destructive">*</span>
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              >
                <SelectTrigger
                  id="tx-pm"
                  data-ocid="transaction_form.payment_method_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethod.cash}>Cash</SelectItem>
                  <SelectItem value={PaymentMethod.gcash}>GCash</SelectItem>
                  <SelectItem value={PaymentMethod.bankTransfer}>
                    Bank Transfer
                  </SelectItem>
                  <SelectItem value={PaymentMethod.check}>Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional: Project + Supplier row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="tx-project" className="text-xs font-semibold">
                Project (optional)
              </Label>
              <Select
                value={projectId || "none"}
                onValueChange={(v) => setProjectId(v === "none" ? "" : v)}
              >
                <SelectTrigger
                  id="tx-project"
                  data-ocid="transaction_form.project_select"
                >
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={String(p.id)} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="tx-supplier" className="text-xs font-semibold">
                Supplier (optional)
              </Label>
              <Select
                value={supplierId || "none"}
                onValueChange={(v) => setSupplierId(v === "none" ? "" : v)}
              >
                <SelectTrigger
                  id="tx-supplier"
                  data-ocid="transaction_form.supplier_select"
                >
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={String(s.id)} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Check Details Section */}
          {isCheck && (
            <>
              <Separator />
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Check Payment Details
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="check-payee"
                    className="text-xs font-semibold"
                  >
                    Payee <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="check-payee"
                    value={checkPayee}
                    onChange={(e) => setCheckPayee(e.target.value)}
                    placeholder="Payee name"
                    required={isCheck}
                    data-ocid="transaction_form.check_payee_input"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="check-bank" className="text-xs font-semibold">
                    Bank Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="check-bank"
                    value={checkBankName}
                    onChange={(e) => setCheckBankName(e.target.value)}
                    placeholder="Bank name"
                    required={isCheck}
                    data-ocid="transaction_form.check_bank_input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="check-date" className="text-xs font-semibold">
                    Check Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="check-date"
                    type="date"
                    value={checkDate}
                    onChange={(e) => setCheckDate(e.target.value)}
                    required={isCheck}
                    data-ocid="transaction_form.check_date_input"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="check-number"
                    className="text-xs font-semibold"
                  >
                    Check Number{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="check-number"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                    placeholder="e.g. 0012345"
                    data-ocid="transaction_form.check_number_input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="check-purpose"
                    className="text-xs font-semibold"
                  >
                    Purpose <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="check-purpose"
                    value={checkPurpose}
                    onChange={(e) => setCheckPurpose(e.target.value)}
                    placeholder="Check purpose"
                    required={isCheck}
                    data-ocid="transaction_form.check_purpose_input"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="check-status"
                    className="text-xs font-semibold"
                  >
                    Check Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={checkStatus}
                    onValueChange={(v) => setCheckStatus(v as CheckStatus)}
                  >
                    <SelectTrigger
                      id="check-status"
                      data-ocid="transaction_form.check_status_select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CheckStatus.pendingIssuance}>
                        Pending Issuance
                      </SelectItem>
                      <SelectItem value={CheckStatus.issued}>Issued</SelectItem>
                      <SelectItem value={CheckStatus.cleared}>
                        Cleared
                      </SelectItem>
                      <SelectItem value={CheckStatus.cancelled}>
                        Cancelled
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              data-ocid="transaction_form.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="transaction_form.submit_button"
            >
              {isSubmitting
                ? "Saving…"
                : editing
                  ? "Save Changes"
                  : "Add Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
