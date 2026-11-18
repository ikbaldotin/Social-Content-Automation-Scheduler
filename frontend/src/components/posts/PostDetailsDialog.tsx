import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

import { getPostById, type Post, type PostDetails } from "../../api/post.api";

import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface PostDetailsDialogProps {
  slug: string;
  post: Post;
}

export default function PostDetailsDialog({
  slug,
  post,
}: PostDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<PostDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = async () => {
    setOpen(true);
    setIsLoading(true);

    try {
      const result = await getPostById(slug, post.id);
      setDetails(result);
    } catch {
      toast.error("Failed to load post details");
    } finally {
      setIsLoading(false);
    }
  };

  const displayedPost = details ?? post;

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        View Details
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
            <DialogDescription>
              Post information and publishing history.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading post details...
            </p>
          ) : (
            <div className="space-y-4">
              {/* Post Information */}
              <Card>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Post Information</h3>

                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                      {displayedPost.status}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap break-words text-sm">
                    {displayedPost.content}
                  </p>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Platform: {displayedPost.socialAccount.platform}</p>

                    <p>Account: {displayedPost.socialAccount.accountName}</p>

                    <p>
                      Created:{" "}
                      {new Date(displayedPost.createdAt).toLocaleString()}
                    </p>

                    {displayedPost.scheduledAt && (
                      <p>
                        Scheduled:{" "}
                        {new Date(displayedPost.scheduledAt).toLocaleString()}
                      </p>
                    )}

                    {displayedPost.publishedAt && (
                      <p>
                        Published:{" "}
                        {new Date(displayedPost.publishedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Publishing History */}
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Publishing History</h3>

                    <span className="text-xs text-muted-foreground">
                      {details?.publishAttempts.length ?? 0} attempts
                    </span>
                  </div>

                  {!details ? (
                    <p className="text-sm text-muted-foreground">
                      Publishing history is not loaded.
                    </p>
                  ) : details.publishAttempts.length === 0 ? (
                    <div className="py-4 text-center">
                      <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />

                      <p className="text-sm text-muted-foreground">
                        No publishing attempts yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {details.publishAttempts.map((attempt) => (
                        <div
                          key={attempt.id}
                          className="space-y-2 rounded-lg border p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {attempt.success ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                              )}

                              <span className="text-sm font-medium">
                                Attempt #{attempt.attemptNo}
                              </span>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                attempt.success
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {attempt.success ? "Success" : "Failed"}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            {new Date(attempt.attemptedAt).toLocaleString()}
                          </p>

                          {!attempt.success && attempt.error && (
                            <div className="rounded-md bg-destructive/10 p-3">
                              <p className="mb-1 text-xs font-semibold text-destructive">
                                Error Details
                              </p>

                              <p className="break-words text-sm text-destructive">
                                {attempt.error}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Media Attachments */}
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Media Attachments</h3>

                    <span className="text-xs text-muted-foreground">
                      {details?.medias.length ?? 0} files
                    </span>
                  </div>

                  {!details || details.medias.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No media attachments.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {details.medias.map((media) => {
                        const isImage = media.mimeType.startsWith("image/");
                        const isVideo = media.mimeType.startsWith("video/");

                        return (
                          <div
                            key={media.id}
                            className="overflow-hidden rounded-lg border"
                          >
                            {isImage ? (
                              <img
                                src={media.fileUrl}
                                alt={media.fileName}
                                className="h-36 w-full object-cover"
                              />
                            ) : isVideo ? (
                              <video
                                src={media.fileUrl}
                                controls
                                className="h-36 w-full bg-black object-contain"
                              />
                            ) : (
                              <div className="flex h-36 items-center justify-center bg-secondary">
                                <span className="text-xs text-muted-foreground">
                                  Unsupported preview
                                </span>
                              </div>
                            )}

                            <div className="space-y-1 p-2">
                              <p className="truncate text-xs font-medium">
                                {media.fileName}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {(media.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
