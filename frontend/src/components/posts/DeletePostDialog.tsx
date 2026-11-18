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
  DialogTrigger,
} from "../ui/dialog";

import type { Post } from "../../api/post.api";
import useWorkspaceStore from "../../stores/workspace.store";
import usePostStore from "../../stores/post.store";

interface Props {
  post: Post;
}

export default function DeletePostDialog({ post }: Props) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const deletePost = usePostStore((state) => state.deletePost);

  const handleDelete = async () => {
    if (!currentWorkspace) {
      toast.error("Please select a workspace");
      return;
    }

    try {
      setIsDeleting(true);

      await deletePost(currentWorkspace.slug, post.id);

      toast.success("Post deleted successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  if (post.status !== "DRAFT") {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Post?</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete this draft post? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
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
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
