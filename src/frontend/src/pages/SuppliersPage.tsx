import { createActor } from "@/backend";
import type { SupplierPublic } from "@/backend";
import { Role } from "@/backend";
import { AppLayout } from "@/components/layout/AppLayout";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import type { SupplierFormData } from "@/components/suppliers/SupplierForm";
import { SupplierTable } from "@/components/suppliers/SupplierTable";
import { TaxReportsTab } from "@/components/suppliers/TaxReportsTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SuppliersPage() {
  const { user } = useAuthStore();
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const isTreasurer = user?.role === Role.treasurer;

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SupplierPublic | null>(null);

  const { data: suppliers = [], isLoading } = useQuery<SupplierPublic[]>({
    queryKey: ["suppliers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSuppliers();
    },
    enabled: !!actor && !isFetching,
  });

  const addMutation = useMutation({
    mutationFn: async (data: SupplierFormData) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addSupplier(
        data.name,
        data.tin,
        data.isVatRegistered,
        data.contactPerson,
        data.phone,
        data.address,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setFormOpen(false);
      toast.success("Supplier added successfully");
    },
    onError: () => toast.error("Failed to add supplier. Please try again."),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: { id: bigint; data: SupplierFormData }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateSupplier(
        id,
        data.name,
        data.tin,
        data.isVatRegistered,
        data.contactPerson,
        data.phone,
        data.address,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setEditTarget(null);
      setFormOpen(false);
      toast.success("Supplier updated successfully");
    },
    onError: () => toast.error("Failed to update supplier. Please try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteSupplier(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier deleted");
    },
    onError: () => toast.error("Failed to delete supplier."),
  });

  function handleEdit(s: SupplierPublic) {
    setEditTarget(s);
    setFormOpen(true);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditTarget(null);
  }

  function handleFormSubmit(data: SupplierFormData) {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data });
    } else {
      addMutation.mutate(data);
    }
  }

  const isPending = addMutation.isPending || updateMutation.isPending;

  // Procurement monitoring — sorted by total purchase amount (computed inside TaxReportsTab)
  const totalSuppliers = suppliers.length;
  const vatRegistered = suppliers.filter((s) => s.isVatRegistered).length;

  return (
    <AppLayout>
      <div className="space-y-6" data-ocid="suppliers.page">
        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              BIR &amp; Supplier Management
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage supplier database, TIN records, VAT compliance, and tax
              reports.
            </p>
          </div>
          {isTreasurer && (
            <Button
              type="button"
              className="gap-2"
              onClick={() => {
                setEditTarget(null);
                setFormOpen(true);
              }}
              data-ocid="suppliers.add_button"
            >
              <Plus size={16} />
              Add Supplier
            </Button>
          )}
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Building2 size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Suppliers</p>
              <p className="text-base font-bold text-foreground">
                {totalSuppliers}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
              <Receipt size={16} className="text-green-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">VAT Registered</p>
              <p className="text-base font-bold text-foreground">
                {vatRegistered}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Building2 size={16} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Non-VAT</p>
              <p className="text-base font-bold text-foreground">
                {totalSuppliers - vatRegistered}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="suppliers" className="space-y-4">
          <TabsList className="border border-border bg-muted/40 h-9">
            <TabsTrigger
              value="suppliers"
              className="text-xs"
              data-ocid="suppliers.tab"
            >
              <Building2 size={13} className="mr-1.5" />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="tax" className="text-xs" data-ocid="tax.tab">
              <Receipt size={13} className="mr-1.5" />
              Tax Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suppliers" className="mt-0">
            <SupplierTable
              suppliers={suppliers}
              isLoading={isLoading}
              isTreasurer={isTreasurer}
              onEdit={handleEdit}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeleting={deleteMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="tax" className="mt-0">
            <TaxReportsTab suppliers={suppliers} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>

      <SupplierForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initial={editTarget}
        isPending={isPending}
      />
    </AppLayout>
  );
}
