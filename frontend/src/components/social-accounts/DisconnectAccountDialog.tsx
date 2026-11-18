import { useState } from "react";
import { Unplug } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import useWorkspaceStore from "../../stores/workspace.store";
import useSocialAccountStore from "../../stores/social-account.store";

interface Props {
  accountId: string;
  accountName: string;
}

export default function DisconnectAccountDialog({
  accountId,
  accountName,
}: Props) {
  const [open, setOpen] = useState(false);

  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const disconnectAccount = useSocialAccountStore(
    (state) => state.disconnectAccount,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDisconnect = async () => {
    if (!currentWorkspace) return;

    try {
      setIsSubmitting(true);

      await disconnectAccount(currentWorkspace.slug, accountId);

      toast.success("Instagram account disconnected");
      setOpen(false);
    } catch {
      toast.error("Failed to disconnect Instagram account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <Unplug className="mr-2 h-4 w-4" />
            Disconnect
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disconnect Instagram?</DialogTitle>

          <DialogDescription>
            Are you sure you want to disconnect <strong>{accountName}</strong>?
            Your account will no longer be available for publishing in this
            workspace.
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
            onClick={handleDisconnect}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Disconnecting..." : "Confirm Disconnect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
