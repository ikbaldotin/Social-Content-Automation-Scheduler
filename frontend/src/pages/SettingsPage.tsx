import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, Save, User } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";

import DeleteWorkspaceDialog from "../components/settings/DeleteWorkspaceDialog";

import { Button } from "../components/ui/button";
import useWorkspaceStore from "../stores/workspace.store";
import useAuthStore from "../stores/auth.store";

export default function SettingsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);

  const user = useAuthStore((state) => state.user);

  const [name, setName] = useState(currentWorkspace?.name ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(currentWorkspace?.name ?? "");
  }, [currentWorkspace?.id, currentWorkspace?.name]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentWorkspace?.slug) {
      toast.error("Please select a workspace");
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Workspace name is required");
      return;
    }

    if (trimmedName === currentWorkspace.name) {
      toast.info("No changes to save");
      return;
    }

    try {
      setIsSaving(true);

      await updateWorkspace(currentWorkspace.slug, {
        name: trimmedName,
      });

      toast.success("Workspace updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update workspace",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="py-16 text-center">
        <Building2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

        <h2 className="font-semibold">No workspace selected</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Select a workspace to manage its settings.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

        <p className="text-sm text-muted-foreground">
          Manage your workspace and account information.
        </p>
      </div>

      {/* Workspace information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Workspace information
          </CardTitle>

          <CardDescription>
            Update the basic information for your workspace.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="workspace-name" className="text-sm font-medium">
                Workspace name
              </label>

              <Input
                id="workspace-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workspace name"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="workspace-slug" className="text-sm font-medium">
                Workspace slug
              </label>

              <Input
                id="workspace-slug"
                value={currentWorkspace.slug}
                disabled
              />

              <p className="text-xs text-muted-foreground">
                The workspace slug is read-only.
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>

          <CardDescription>
            Information about your logged-in account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Name</p>

            <p className="font-medium">{user?.name ?? "Not available"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Email</p>

            <p className="font-medium">{user?.email ?? "Not available"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Account ID</p>

            <p className="break-all font-mono text-sm">
              {user?.id ?? "Not available"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>

          <CardDescription>Permanently delete this workspace.</CardDescription>
        </CardHeader>

        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Delete this workspace</p>

            <p className="text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
          </div>

          <DeleteWorkspaceDialog />
        </CardContent>
      </Card>
    </div>
  );
}
