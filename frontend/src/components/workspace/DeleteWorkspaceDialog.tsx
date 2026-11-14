import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

import useWorkspaceStore from "../../stores/workspace.store";

export default function DeleteWorkspaceDialog() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!currentWorkspace) return;

    try {
      setIsSubmitting(true);

      await deleteWorkspace(currentWorkspace.slug);

      toast.success("Workspace deleted successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to delete workspace. Only the owner can delete it.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="w-auto shrink-0 justify-start text-destructive hover:text-destructive"
        disabled={!currentWorkspace}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Workspace
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{currentWorkspace?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
