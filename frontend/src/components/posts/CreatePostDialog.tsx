import { useEffect, useState } from "react";
import { Plus, UploadCloud, X } from "lucide-react";
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

import { uploadPostMedia } from "../../api/media.api";

type PostMode = "DRAFT" | "SCHEDULED";

export default function CreatePostDialog() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [socialAccountId, setSocialAccountId] = useState("");
  const [mode, setMode] = useState<PostMode>("DRAFT");
  const [scheduledAt, setScheduledAt] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const socialAccounts = useSocialAccountStore((state) => state.socialAccounts);

  const fetchSocialAccounts = useSocialAccountStore(
    (state) => state.fetchSocialAccounts,
  );

  const createPost = usePostStore((state) => state.createPost);

  const schedulePost = usePostStore((state) => state.schedulePost);

  // Fetch social accounts when dialog opens.
  useEffect(() => {
    if (open && currentWorkspace?.slug) {
      void fetchSocialAccounts(currentWorkspace.slug);
    }
  }, [open, currentWorkspace?.slug, fetchSocialAccounts]);

  // Reset selected account when workspace changes.
  useEffect(() => {
    setSocialAccountId("");
  }, [currentWorkspace?.slug]);

  // Generate image preview.
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const resetForm = () => {
    setContent("");
    setSocialAccountId("");
    setMode("DRAFT");
    setScheduledAt("");
    setSelectedFile(null);
  };

  // Handle image selection.
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    event.target.value = "";
  };

  // Create and upload post.
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

    if (!selectedFile) {
      toast.error("Please select an image");
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
      // 1. Create post as DRAFT.
      const post = await createPost(currentWorkspace.slug, {
        content: content.trim(),
        socialAccountId,
      });

      // 2. Upload image.
      try {
        await uploadPostMedia(currentWorkspace.slug, post.id, selectedFile);
      } catch {
        toast.error(
          "Post created, but image upload failed. The post remains a draft.",
        );
        return;
      }

      // 3. Schedule after successful image upload.
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
            "Image uploaded, but scheduling failed. Your post remains a draft.",
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

  const handleDialogChange = (nextOpen: boolean) => {
    if (isSubmitting) return;

    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create Post
      </Button>

      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>

            <DialogDescription>
              Create a draft or schedule a post for later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Social Account */}
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

            {/* Post Content */}
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

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Post Image</label>

              {previewUrl ? (
                <div className="relative overflow-hidden rounded-lg border">
                  <img
                    src={previewUrl}
                    alt="Post preview"
                    className="max-h-64 w-full object-contain"
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setSelectedFile(null)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="border-t p-2 text-xs text-muted-foreground">
                    {selectedFile?.name}
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition hover:bg-muted/50">
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />

                  <span className="text-sm font-medium">
                    Click to upload an image
                  </span>

                  <span className="text-xs text-muted-foreground">
                    Image files, maximum 5 MB
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>

            {/* Publishing Option - Always Visible */}
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

            {/* Schedule Date - Only When Scheduled */}
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

            {/* Submit Button */}
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
