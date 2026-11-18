import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import useWorkspaceStore from "../stores/workspace.store";
import useSocialAccountStore from "../stores/social-account.store";
import usePostStore from "../stores/post.store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function CreatePostDialog() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const createPost = usePostStore((state) => state.createPost);

  const socialAccounts = useSocialAccountStore((state) => state.socialAccounts);

  const isLoadingAccounts = useSocialAccountStore((state) => state.isLoading);

  const fetchSocialAccounts = useSocialAccountStore(
    (state) => state.fetchSocialAccounts,
  );

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [socialAccountId, setSocialAccountId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && currentWorkspace?.slug) {
      void fetchSocialAccounts(currentWorkspace.slug).catch(() => {
        toast.error("Failed to load social accounts");
      });
    }
  }, [open, currentWorkspace?.slug, fetchSocialAccounts]);

  useEffect(() => {
    setSocialAccountId("");
  }, [currentWorkspace?.slug]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentWorkspace) {
      toast.error("Please select a workspace");
      return;
    }

    if (!socialAccountId) {
      toast.error("Please select a social account");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter post content");
      return;
    }

    try {
      setIsSubmitting(true);

      await createPost(currentWorkspace.slug, {
        content: content.trim(),
        socialAccountId,
      });

      toast.success("Draft post created successfully");

      setContent("");
      setSocialAccountId("");
      setOpen(false);
    } catch {
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button disabled={!currentWorkspace}>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>
            Create a draft post for {currentWorkspace?.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Social Account</label>

            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={socialAccountId}
              onChange={(e) => setSocialAccountId(e.target.value)}
              disabled={isLoadingAccounts || socialAccounts.length === 0}
              required
            >
              <option value="">
                {isLoadingAccounts
                  ? "Loading accounts..."
                  : "Select a social account"}
              </option>

              {socialAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.platform} - {account.accountName}
                </option>
              ))}
            </select>

            {!isLoadingAccounts && socialAccounts.length === 0 && (
              <p className="text-xs text-destructive">
                No connected social accounts found in this workspace.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Post Content</label>

            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post caption..."
              required
            />

            <p className="text-xs text-muted-foreground">
              {content.length} characters
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isSubmitting || isLoadingAccounts || socialAccounts.length === 0
            }
          >
            {isSubmitting ? "Creating..." : "Create Draft"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
