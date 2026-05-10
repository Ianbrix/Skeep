import type { SupplierPublic } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

interface SupplierFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => void;
  initial?: SupplierPublic | null;
  isPending: boolean;
}

export interface SupplierFormData {
  name: string;
  tin: string;
  isVatRegistered: boolean;
  contactPerson: string;
  phone: string;
  address: string;
}

const EMPTY: SupplierFormData = {
  name: "",
  tin: "",
  isVatRegistered: false,
  contactPerson: "",
  phone: "",
  address: "",
};

export function SupplierForm({
  open,
  onClose,
  onSubmit,
  initial,
  isPending,
}: SupplierFormProps) {
  const [form, setForm] = useState<SupplierFormData>(EMPTY);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name,
              tin: initial.tin,
              isVatRegistered: initial.isVatRegistered,
              contactPerson: initial.contactPerson,
              phone: initial.phone,
              address: initial.address,
            }
          : EMPTY,
      );
    }
  }, [open, initial]);

  function handleChange(
    field: keyof SupplierFormData,
    value: string | boolean,
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md" data-ocid="supplier.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {initial ? "Edit Supplier" : "Add New Supplier"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1">
            <Label htmlFor="sup-name">Supplier Name *</Label>
            <Input
              id="sup-name"
              data-ocid="supplier.name.input"
              placeholder="e.g. ABC Trading Co."
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sup-tin">TIN *</Label>
              <Input
                id="sup-tin"
                data-ocid="supplier.tin.input"
                placeholder="000-000-000-000"
                value={form.tin}
                onChange={(e) => handleChange("tin", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sup-phone">Phone *</Label>
              <Input
                id="sup-phone"
                data-ocid="supplier.phone.input"
                placeholder="09XX-XXX-XXXX"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="sup-contact">Contact Person *</Label>
            <Input
              id="sup-contact"
              data-ocid="supplier.contact.input"
              placeholder="Full name of contact"
              value={form.contactPerson}
              onChange={(e) => handleChange("contactPerson", e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="sup-address">Address *</Label>
            <Input
              id="sup-address"
              data-ocid="supplier.address.input"
              placeholder="Complete business address"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium">VAT Registered</p>
              <p className="text-xs text-muted-foreground">
                Subject to 12% VAT computation
              </p>
            </div>
            <Switch
              data-ocid="supplier.vat.switch"
              checked={form.isVatRegistered}
              onCheckedChange={(v) => handleChange("isVatRegistered", v)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="supplier.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="supplier.submit_button"
            >
              {isPending
                ? "Saving..."
                : initial
                  ? "Save Changes"
                  : "Add Supplier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
