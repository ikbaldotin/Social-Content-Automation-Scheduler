import { useState } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { WorkspaceMember } from "../../api/membership.api";

interface UpdateMemberRoleDialogProps {
  member: WorkspaceMember;
}

export default function UpdateMemberRoleDialog({
  member,
}: UpdateMemberRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "MEMBER">(
    member.role === "ADMIN" ? "ADMIN" : "MEMBER",
  );

  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const updateMemberRole = useMembershipStore(
    (state) => state.updateMemberRole,
  );

  const isLoading = useMembershipStore((state) => state.isLoading);

  const handleUpdateRole = async () => {
    if (!currentWorkspace?.slug) {
      toast.error("Please select a workspace");
      return;
    }

    const targetUserId = member.userId ?? member.user?.id;
    if (!targetUserId) {
      toast.error("Unable to identify this member");
      return;
    }

    if (role === member.role) {
      setOpen(false);
      return;
    }

    try {
      await updateMemberRole(currentWorkspace.slug, targetUserId, {
        role,
      });

      toast.success("Member role updated successfully");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update member role",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Change Role
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update member role</DialogTitle>
          <DialogDescription>
            Change the workspace role for{" "}
            {member.name ?? member.user?.name ?? "this member"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">Select role</label>

          <Select
            value={role}
            onValueChange={(value) => {
              if (value === "ADMIN" || value === "MEMBER") {
                setRole(value);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="MEMBER">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleUpdateRole}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Updating..." : "Save Changes"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
