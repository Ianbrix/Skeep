import type { ProjectPublic } from "@/backend";
import { ProjectStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Edit2,
  MoreVertical,
  Trash2,
} from "lucide-react";

const PESO = (n: bigint | number) =>
  `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const formatDate = (ts: bigint) =>
  new Date(Number(ts) / 1_000_000).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  [ProjectStatus.planning]: {
    label: "Planning",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  [ProjectStatus.ongoing]: {
    label: "Ongoing",
    className: "bg-accent/20 text-yellow-800 border-accent/40",
  },
  [ProjectStatus.completed]: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
};

interface ProjectCardProps {
  project: ProjectPublic;
  isTreasurer: boolean;
  onEdit: (project: ProjectPublic) => void;
  onDelete: (project: ProjectPublic) => void;
  onStatusChange: (project: ProjectPublic, status: ProjectStatus) => void;
  onClick: (project: ProjectPublic) => void;
  index: number;
}

export function ProjectCard({
  project,
  isTreasurer,
  onEdit,
  onDelete,
  onStatusChange,
  onClick,
  index,
}: ProjectCardProps) {
  const budget = Number(project.budgetAllocation);
  const spent = Number(project.totalExpenses);
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOverBudget = spent > budget;
  const statusCfg = STATUS_CONFIG[project.status];

  const nextStatuses = {
    [ProjectStatus.planning]: [
      { value: ProjectStatus.ongoing, label: "Mark as Ongoing" },
      { value: ProjectStatus.completed, label: "Mark as Completed" },
    ],
    [ProjectStatus.ongoing]: [
      { value: ProjectStatus.planning, label: "Revert to Planning" },
      { value: ProjectStatus.completed, label: "Mark as Completed" },
    ],
    [ProjectStatus.completed]: [
      { value: ProjectStatus.planning, label: "Revert to Planning" },
      { value: ProjectStatus.ongoing, label: "Revert to Ongoing" },
    ],
  };

  return (
    <Card
      className="border-border hover:shadow-md transition-smooth cursor-pointer group"
      data-ocid={`projects.item.${index}`}
      onClick={() => onClick(project)}
    >
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground truncate text-base leading-tight">
              {project.name}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          </div>
          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Badge
              className={`text-xs px-2 py-0.5 border font-medium ${statusCfg.className}`}
            >
              {statusCfg.label}
            </Badge>
            {isTreasurer && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-60 group-hover:opacity-100 transition-opacity"
                    data-ocid={`projects.item.${index}.dropdown_menu`}
                  >
                    <MoreVertical size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {nextStatuses[project.status].map((s) => (
                    <DropdownMenuItem
                      key={s.value}
                      onClick={() => onStatusChange(project, s.value)}
                      className="cursor-pointer"
                    >
                      <ChevronDown size={14} className="mr-2" />
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onEdit(project)}
                    className="cursor-pointer"
                    data-ocid={`projects.item.${index}.edit_button`}
                  >
                    <Edit2 size={14} className="mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(project)}
                    className="cursor-pointer text-destructive focus:text-destructive"
                    data-ocid={`projects.item.${index}.delete_button`}
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Budget info */}
        <div className="mb-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-mono font-semibold text-foreground">
              {PESO(budget)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Spent</span>
            <span
              className={`font-mono font-semibold ${
                isOverBudget ? "text-destructive" : "text-foreground"
              }`}
            >
              {PESO(spent)}
              {isOverBudget && (
                <AlertTriangle
                  size={10}
                  className="inline ml-1 text-destructive"
                />
              )}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? "bg-destructive"
                  : pct > 80
                    ? "bg-accent"
                    : "bg-primary"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span
              className={`font-medium ${
                isOverBudget ? "text-destructive" : ""
              }`}
            >
              {isOverBudget
                ? `Over by ${PESO(spent - budget)}`
                : `${pct.toFixed(1)}% used`}
            </span>
            {isOverBudget && (
              <Badge
                variant="destructive"
                className="text-[10px] py-0 px-1.5 h-4"
              >
                Budget Exceeded
              </Badge>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-3">
          <div className="flex items-center gap-1">
            <Calendar size={11} />
            <span>Start: {formatDate(project.startDate)}</span>
          </div>
          {project.endDate && (
            <div className="flex items-center gap-1">
              <Calendar size={11} />
              <span>End: {formatDate(project.endDate)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
