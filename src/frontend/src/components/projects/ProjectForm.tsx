import type { AddProjectInput, ProjectPublic } from "@/backend";
import { ProjectStatus } from "@/backend";
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
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: AddProjectInput, status?: ProjectStatus) => Promise<void>;
  editProject?: ProjectPublic | null;
  isLoading?: boolean;
}

const tsToDateString = (ts: bigint): string => {
  const d = new Date(Number(ts) / 1_000_000);
  return d.toISOString().split("T")[0];
};

const dateStringToTs = (s: string): bigint => {
  return BigInt(new Date(s).getTime()) * 1_000_000n;
};

export function ProjectForm({
  open,
  onClose,
  onSubmit,
  editProject,
  isLoading,
}: ProjectFormProps) {
  const isEdit = !!editProject;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.planning);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (editProject) {
        setName(editProject.name);
        setDescription(editProject.description);
        setBudget(String(Number(editProject.budgetAllocation)));
        setStartDate(tsToDateString(editProject.startDate));
        setEndDate(
          editProject.endDate ? tsToDateString(editProject.endDate) : "",
        );
        setStatus(editProject.status);
      } else {
        setName("");
        setDescription("");
        setBudget("");
        setStartDate("");
        setEndDate("");
        setStatus(ProjectStatus.planning);
      }
      setErrors({});
    }
  }, [open, editProject]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Project name is required.";
    if (!budget.trim() || Number(budget) <= 0)
      e.budget = "Enter a valid budget amount.";
    if (!startDate) e.startDate = "Start date is required.";
    if (endDate && endDate < startDate)
      e.endDate = "End date must be after start date.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const input: AddProjectInput = {
      name: name.trim(),
      description: description.trim(),
      budgetAllocation: BigInt(Math.round(Number(budget))),
      startDate: dateStringToTs(startDate),
      endDate: endDate ? dateStringToTs(endDate) : undefined,
    };
    await onSubmit(input, status);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg"
        data-ocid={isEdit ? "projects.edit_dialog" : "projects.add_dialog"}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {isEdit ? "Edit Project" : "Add New Project"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-name">Project Name *</Label>
            <Input
              id="proj-name"
              placeholder="e.g., Barangay Road Improvement"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="projects.form.name_input"
            />
            {errors.name && (
              <p
                className="text-xs text-destructive"
                data-ocid="projects.form.name_error"
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-desc">Description</Label>
            <Textarea
              id="proj-desc"
              placeholder="Describe the project objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              data-ocid="projects.form.description_input"
            />
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-budget">Budget Allocation (₱) *</Label>
            <Input
              id="proj-budget"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              data-ocid="projects.form.budget_input"
            />
            {errors.budget && (
              <p
                className="text-xs text-destructive"
                data-ocid="projects.form.budget_error"
              >
                {errors.budget}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="proj-start">Start Date *</Label>
              <Input
                id="proj-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-ocid="projects.form.start_date_input"
              />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-end">End Date (optional)</Label>
              <Input
                id="proj-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-ocid="projects.form.end_date_input"
              />
              {errors.endDate && (
                <p className="text-xs text-destructive">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as ProjectStatus)}
            >
              <SelectTrigger data-ocid="projects.form.status_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProjectStatus.planning}>Planning</SelectItem>
                <SelectItem value={ProjectStatus.ongoing}>Ongoing</SelectItem>
                <SelectItem value={ProjectStatus.completed}>
                  Completed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            data-ocid="projects.form.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            data-ocid="projects.form.submit_button"
          >
            {isLoading ? "Saving..." : isEdit ? "Save Changes" : "Add Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
