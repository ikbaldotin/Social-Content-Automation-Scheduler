import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import useWorkspaceStore from "../../stores/workspace.store";
import useSocialAccountStore from "../../stores/social-account.store";
import usePostStore from "../../stores/post.store";

type PostMode = "DRAFT" | "SCHEDULED";

export default function CreatePostDialog() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [socialAccountId, setSocialAccountId] = useState("");
  const [mode, setMode] = useState<PostMode>("DRAFT");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const socialAccounts = useSocialAccountStore((state) => state.socialAccounts);
  const fetchSocialAccounts = useSocialAccountStore(
    (state) => state.fetchSocialAccounts,
  );

  const createPost = usePostStore((state) => state.createPost);
  const schedulePost = usePostStore((state) => state.schedulePost);

  useEffect(() => {
    if (open && currentWorkspace?.slug) {
      fetchSocialAccounts(currentWorkspace.slug);
    }
  }, [open, currentWorkspace?.slug, fetchSocialAccounts]);

  useEffect(() => {
    setSocialAccountId("");
  }, [currentWorkspace?.slug]);

  const resetForm = () => {
    setContent("");
    setSocialAccountId("");
    setMode("DRAFT");
    setScheduledAt("");
  };

  const handleSubmit = async () => {
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

    if (mode === "SCHEDULED") {
      if (!scheduledAt) {
        toast.error("Please select a date and time");
        return;
      }

      const selectedDate = new Date(scheduledAt);

      if (Number.isNaN(selectedDate.getTime())) {
        toast.error("Invalid schedule date");
        return;
      }

      if (selectedDate.getTime() <= Date.now()) {
        toast.error("Schedule time must be in the future");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const post = await createPost(currentWorkspace.slug, {
        content: content.trim(),
        socialAccountId,
      });

      if (mode === "SCHEDULED") {
        try {
          await schedulePost(
            currentWorkspace.slug,
            post.id,
            new Date(scheduledAt).toISOString(),
          );
          toast.success("Post scheduled successfully");
        } catch {
          toast.error(
            "Draft created, but scheduling failed. You can schedule it again later.",
          );
          return;
        }
      } else {
        toast.success("Draft post created successfully");
      }

      resetForm();
      setOpen(false);
    } catch {
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create Post
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
            <DialogDescription>
              Create a draft or schedule a post for later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Social Account</label>

              <select
                value={socialAccountId}
                onChange={(event) => setSocialAccountId(event.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Select an account</option>
                {socialAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.platform} — {account.accountName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Post Content</label>

              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write your post..."
                rows={5}
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Publishing Option</label>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={mode === "DRAFT" ? "default" : "outline"}
                  onClick={() => setMode("DRAFT")}
                  className="flex-1"
                >
                  Save as Draft
                </Button>

                <Button
                  type="button"
                  variant={mode === "SCHEDULED" ? "default" : "outline"}
                  onClick={() => setMode("SCHEDULED")}
                  className="flex-1"
                >
                  Schedule Post
                </Button>
              </div>
            </div>

            {mode === "SCHEDULED" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Schedule Date & Time
                </label>

                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                />
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Please wait..."
                : mode === "DRAFT"
                  ? "Create Draft"
                  : "Schedule Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
