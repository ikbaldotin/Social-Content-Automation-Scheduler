import { useState } from "react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import usePostStore from "../../stores/post.store";

interface ReschedulePostDialogProps {
  slug: string;
  postId: string;
  scheduledAt: string | null;
}

export default function ReschedulePostDialog({
  slug,
  postId,
  scheduledAt,
}: ReschedulePostDialogProps) {
  const [open, setOpen] = useState(false);

  const [newScheduledAt, setNewScheduledAt] = useState(() => {
    if (!scheduledAt) return "";

    const date = new Date(scheduledAt);

    const timezoneOffset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const reschedulePost = usePostStore((state) => state.reschedulePost);

  const handleReschedule = async () => {
    if (!newScheduledAt) {
      toast.error("Please select a date and time");
      return;
    }

    const selectedDate = new Date(newScheduledAt);

    if (Number.isNaN(selectedDate.getTime())) {
      toast.error("Invalid schedule date");
      return;
    }

    if (selectedDate.getTime() <= Date.now()) {
      toast.error("Schedule time must be in the future");
      return;
    }

    setIsSubmitting(true);

    try {
      await reschedulePost(slug, postId, selectedDate.toISOString());

      toast.success("Post rescheduled successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to reschedule post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Reschedule
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Post</DialogTitle>

            <DialogDescription>
              Choose a new date and time for this post.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                New Schedule Date & Time
              </label>

              <Input
                type="datetime-local"
                value={newScheduledAt}
                onChange={(event) => setNewScheduledAt(event.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleReschedule}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Rescheduling..." : "Update Schedule"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
