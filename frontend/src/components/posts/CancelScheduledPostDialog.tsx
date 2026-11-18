import { useState } from "react";
import { CalendarX } from "lucide-react";
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

import type { Post } from "../../api/post.api";
import useWorkspaceStore from "../../stores/workspace.store";
import usePostStore from "../../stores/post.store";

interface Props {
  post: Post;
}

export default function CancelScheduledPostDialog({ post }: Props) {
  const [open, setOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const cancelScheduledPost = usePostStore(
    (state) => state.cancelScheduledPost,
  );

  const handleCancel = async () => {
    if (!currentWorkspace) {
      toast.error("Please select a workspace");
      return;
    }

    try {
      setIsCancelling(true);

      await cancelScheduledPost(currentWorkspace.slug, post.id);

      toast.success("Scheduled post cancelled successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to cancel scheduled post");
    } finally {
      setIsCancelling(false);
    }
  };

  if (post.status !== "SCHEDULED") {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <CalendarX className="mr-2 h-4 w-4" />
            Cancel Schedule
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Scheduled Post?</DialogTitle>

          <DialogDescription>
            Are you sure you want to cancel this scheduled post? It will no
            longer be published automatically.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isCancelling}
          >
            Keep Scheduled
          </Button>

          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Confirm Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
