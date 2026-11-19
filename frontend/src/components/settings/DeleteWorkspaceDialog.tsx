import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import { Button } from "../ui/button";
import useWorkspaceStore from "../../stores/workspace.store";

export default function DeleteWorkspaceDialog() {
  const [open, setOpen] = useState(false);

  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!currentWorkspace?.slug) {
      toast.error("No workspace selected");
      return;
    }

    try {
      setIsDeleting(true);

      await deleteWorkspace(currentWorkspace.slug);

      toast.success("Workspace deleted successfully");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete workspace",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentWorkspace) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Workspace
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete workspace?</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong>{currentWorkspace.name}</strong>? This action cannot be
            undone. All workspace data may also be deleted depending on your
            backend deletion logic.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Workspace"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
