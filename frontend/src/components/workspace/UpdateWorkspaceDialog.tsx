import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

import useWorkspaceStore from "../../stores/workspace.store";

export default function UpdateWorkspaceDialog() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && currentWorkspace) {
      setName(currentWorkspace.name);
      setSlug(currentWorkspace.slug);
    }
  }, [open, currentWorkspace]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentWorkspace || !name.trim() || !slug.trim()) {
      toast.error("Please enter valid workspace details");
      return;
    }

    try {
      setIsSubmitting(true);

      await updateWorkspace(currentWorkspace.slug, {
        name: name.trim(),
        updateSlug: slug.trim(),
      });

      toast.success("Workspace updated successfully");
      setOpen(false);
    } catch {
      toast.error(
        "Failed to update workspace. Check permissions and slug availability.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="w-auto shrink-0 justify-start"
        disabled={!currentWorkspace}
        onClick={() => setOpen(true)}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Update Workspace
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Workspace</DialogTitle>
            <DialogDescription>
              Change your workspace name or slug.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Workspace name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Agency"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Workspace slug</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-agency"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
