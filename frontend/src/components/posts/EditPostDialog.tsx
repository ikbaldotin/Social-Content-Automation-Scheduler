import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
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
import useSocialAccountStore from "../../stores/social-account.store";

interface Props {
  post: Post;
}

export default function EditPostDialog({ post }: Props) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(post.content);
  const [socialAccountId, setSocialAccountId] = useState(post.socialAccount.id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const updatePost = usePostStore((state) => state.updatePost);

  const socialAccounts = useSocialAccountStore((state) => state.socialAccounts);

  const isLoadingAccounts = useSocialAccountStore((state) => state.isLoading);

  const fetchSocialAccounts = useSocialAccountStore(
    (state) => state.fetchSocialAccounts,
  );

  useEffect(() => {
    if (!open || !currentWorkspace) return;

    setContent(post.content);
    setSocialAccountId(post.socialAccount.id);

    void fetchSocialAccounts(currentWorkspace.slug).catch(() => {
      toast.error("Failed to load social accounts");
    });
  }, [
    open,
    currentWorkspace,
    post.content,
    post.socialAccount.id,
    fetchSocialAccounts,
  ]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentWorkspace) {
      toast.error("Please select a workspace");
      return;
    }

    if (!content.trim()) {
      toast.error("Post caption cannot be empty");
      return;
    }

    if (!socialAccountId) {
      toast.error("Please select a social account");
      return;
    }

    try {
      setIsSubmitting(true);

      await updatePost(currentWorkspace.slug, post.id, {
        content: content.trim(),
        socialAccountId,
      });

      toast.success("Post updated successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (post.status !== "DRAFT") {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Update your draft caption or choose another social account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="post-content" className="text-sm font-medium">
              Caption
            </label>

            <textarea
              id="post-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write your post caption..."
              rows={5}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="social-account" className="text-sm font-medium">
              Social Account
            </label>

            <select
              id="social-account"
              value={socialAccountId}
              onChange={(event) => setSocialAccountId(event.target.value)}
              disabled={isSubmitting || isLoadingAccounts}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {socialAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.platform} - {account.accountName}
                </option>
              ))}
            </select>

            {socialAccounts.length === 0 && (
              <p className="text-xs text-destructive">
                No active social accounts available.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isSubmitting || isLoadingAccounts || socialAccounts.length === 0
              }
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
