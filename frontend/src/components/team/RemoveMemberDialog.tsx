import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { WorkspaceMember } from "../../api/membership.api";
import useWorkspaceStore from "../../stores/workspace.store";
import useMembershipStore from "../../stores/membership.store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface RemoveMemberDialogProps {
  member: WorkspaceMember;
}

export default function RemoveMemberDialog({
  member,
}: RemoveMemberDialogProps) {
  const [open, setOpen] = useState(false);

  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const removeMember = useMembershipStore((state) => state.removeMember);

  const isLoading = useMembershipStore((state) => state.isLoading);

  const memberName = member.name ?? member.user?.name ?? "this member";

  const handleRemoveMember = async () => {
    if (!currentWorkspace?.slug) {
      toast.error("Please select a workspace");
      return;
    }

    try {
      await removeMember(currentWorkspace.slug, member.userId);

      toast.success("Member removed successfully");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove member",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove workspace member?</DialogTitle>

          <DialogDescription>
            Are you sure you want to remove {memberName} from this workspace?
            They will lose access to this workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleRemoveMember}
            disabled={isLoading}
          >
            {isLoading ? "Removing..." : "Remove Member"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
