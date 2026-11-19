import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
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
import { Input } from "../ui/input";

export default function AddMemberDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const addMember = useMembershipStore((state) => state.addMember);
  const isLoading = useMembershipStore((state) => state.isLoading);

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentWorkspace?.slug) {
      toast.error("Please select a workspace");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Email is required");
      return;
    }

    try {
      await addMember(currentWorkspace.slug, { email: normalizedEmail });

      toast.success("Member added successfully");
      setEmail("");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add member",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <UserPlus className="mr-2 h-4 w-4" />
        Add Member
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add workspace member</DialogTitle>
          <DialogDescription>
            Enter the email address of an existing registered user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="member-email" className="text-sm font-medium">
              Email address
            </label>

            <Input
              id="member-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Member"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
