import { createActor } from "@/backend";
import type { UserPublic } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation } from "@tanstack/react-query";
import { Edit2, Save, User, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ProfileTab() {
  const { user, login, token } = useAuthStore();
  const { actor } = useActor(createActor);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");

  const updateMutation = useMutation({
    mutationFn: async (newName: string) => {
      if (!actor || !user) throw new Error("Not available");
      const updated = await actor.getUserById(user.id);
      if (!updated) throw new Error("User not found");
      return { ...updated, name: newName } as UserPublic;
    },
    onSuccess: (updated) => {
      if (token) login(updated, token);
      setEditing(false);
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const handleSave = () => {
    if (!nameInput.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    updateMutation.mutate(nameInput.trim());
  };

  const handleCancel = () => {
    setNameInput(user?.name ?? "");
    setEditing(false);
  };

  const roleLabel =
    user?.role === "treasurer" ? "SK Treasurer" : "SK Chairperson";

  return (
    <div className="space-y-6">
      {/* Avatar & Name */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold flex-shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{user?.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {user?.email}
          </p>
          <Badge
            className="mt-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10 text-xs"
            data-ocid="profile.role.badge"
          >
            {roleLabel}
          </Badge>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="profile-name" className="text-sm font-medium">
            Full Name
          </Label>
          {editing ? (
            <div className="flex gap-2">
              <Input
                id="profile-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1"
                data-ocid="profile.name.input"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateMutation.isPending}
                data-ocid="profile.save.button"
              >
                <Save size={14} className="mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                data-ocid="profile.cancel.button"
              >
                <X size={14} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground py-2">{user?.name}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
                data-ocid="profile.edit.button"
              >
                <Edit2 size={13} className="mr-1" />
                Edit
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Email Address</Label>
          <p className="text-sm text-muted-foreground py-2">{user?.email}</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Role</Label>
          <div className="flex items-center gap-2 py-2">
            <User size={14} className="text-primary" />
            <span className="text-sm text-foreground">{roleLabel}</span>
            <Badge variant="secondary" className="text-xs">
              {user?.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {user?.role === "chairperson" && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-xs text-primary font-medium">
              SK Chairperson — View & Approval access only
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              You can monitor transactions, review budgets, and approve
              liquidation reports.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
