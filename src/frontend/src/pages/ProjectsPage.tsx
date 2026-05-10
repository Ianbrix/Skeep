import type { AddProjectInput, ProjectPublic } from "@/backend";
import { ProjectStatus } from "@/backend";
import { createActor } from "@/backend";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { ProjectForm } from "@/components/projects/ProjectForm";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, FolderOpen, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type FilterStatus = "all" | ProjectStatus;

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All Projects" },
  { value: ProjectStatus.planning, label: "Planning" },
  { value: ProjectStatus.ongoing, label: "Ongoing" },
  { value: ProjectStatus.completed, label: "Completed" },
];

export function ProjectsPage() {
  const { user } = useAuthStore();
  const isTreasurer = user?.role === "treasurer";
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();

  const [filter, setFilter] = useState<FilterStatus>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<ProjectPublic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectPublic | null>(null);
  const [detailProject, setDetailProject] = useState<ProjectPublic | null>(
    null,
  );

  // Query
  const { data: projects = [], isLoading } = useQuery<ProjectPublic[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProjects();
    },
    enabled: !!actor && !isFetching,
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async ({
      input,
      status,
    }: {
      input: AddProjectInput;
      status?: ProjectStatus;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const project = await actor.addProject(input);
      if (status && status !== ProjectStatus.planning) {
        await actor.updateProjectStatus(project.id, status);
      }
      return project;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project added successfully.");
      setFormOpen(false);
    },
    onError: () => toast.error("Failed to add project."),
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({
      id,
      input,
      status,
    }: {
      id: bigint;
      input: AddProjectInput;
      status?: ProjectStatus;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.updateProject(id, input);
      if (status) {
        await actor.updateProjectStatus(id, status);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated successfully.");
      setEditProject(null);
    },
    onError: () => toast.error("Failed to update project."),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteProject(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted.");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete project."),
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: bigint; status: ProjectStatus }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateProjectStatus(id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Status updated.");
    },
    onError: () => toast.error("Failed to update status."),
  });

  const handleFormSubmit = async (
    input: AddProjectInput,
    status?: ProjectStatus,
  ) => {
    if (editProject) {
      await editMutation.mutateAsync({ id: editProject.id, input, status });
    } else {
      await addMutation.mutateAsync({ input, status });
    }
  };

  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.status === filter);

  const overBudgetCount = projects.filter(
    (p) => Number(p.totalExpenses) > Number(p.budgetAllocation),
  ).length;

  const counts = {
    all: projects.length,
    [ProjectStatus.planning]: projects.filter(
      (p) => p.status === ProjectStatus.planning,
    ).length,
    [ProjectStatus.ongoing]: projects.filter(
      (p) => p.status === ProjectStatus.ongoing,
    ).length,
    [ProjectStatus.completed]: projects.filter(
      (p) => p.status === ProjectStatus.completed,
    ).length,
  };

  return (
    <AppLayout>
      <div className="space-y-6" data-ocid="projects.page">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Project Management
            </h2>
            <p className="text-sm text-muted-foreground">
              Track SK projects, budgets, and progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            {overBudgetCount > 0 && (
              <Badge
                variant="destructive"
                className="flex items-center gap-1"
                data-ocid="projects.overbudget_alert"
              >
                <AlertTriangle size={12} />
                {overBudgetCount} Over Budget
              </Badge>
            )}
            {isTreasurer && (
              <Button
                onClick={() => {
                  setEditProject(null);
                  setFormOpen(true);
                }}
                className="flex items-center gap-2"
                data-ocid="projects.add_button"
              >
                <Plus size={16} />
                Add Project
              </Button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2" data-ocid="projects.filter.tab">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
              data-ocid={`projects.filter.${opt.value}`}
            >
              {opt.label}
              <span
                className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${
                  filter === opt.value
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {counts[opt.value as keyof typeof counts] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Project grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-52 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl bg-card"
            data-ocid="projects.empty_state"
          >
            <FolderOpen size={48} className="text-muted-foreground/40 mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground">
              {filter === "all" ? "No Projects Yet" : `No ${filter} projects`}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {filter === "all"
                ? "Start by creating your first SK project."
                : `No projects with status "${filter}" found.`}
            </p>
            {isTreasurer && filter === "all" && (
              <Button
                onClick={() => {
                  setEditProject(null);
                  setFormOpen(true);
                }}
                data-ocid="projects.empty_state.add_button"
              >
                <Plus size={16} className="mr-2" />
                Add First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project, i) => (
              <ProjectCard
                key={String(project.id)}
                project={project}
                isTreasurer={isTreasurer}
                index={i + 1}
                onClick={(p) => setDetailProject(p)}
                onEdit={(p) => {
                  setEditProject(p);
                  setFormOpen(true);
                }}
                onDelete={(p) => setDeleteTarget(p)}
                onStatusChange={(p, status) =>
                  statusMutation.mutate({ id: p.id, status })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      <ProjectForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditProject(null);
        }}
        onSubmit={handleFormSubmit}
        editProject={editProject}
        isLoading={addMutation.isPending || editMutation.isPending}
      />

      {/* Detail Sheet */}
      <ProjectDetail
        project={detailProject}
        open={!!detailProject}
        onClose={() => setDetailProject(null)}
        isTreasurer={isTreasurer}
        onEdit={(p) => {
          setEditProject(p);
          setFormOpen(true);
        }}
        onDelete={(p) => setDeleteTarget(p)}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="projects.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone and will permanently remove the project and its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="projects.delete_dialog.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="projects.delete_dialog.confirm_button"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
