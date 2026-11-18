import { useEffect } from "react";
import { FileText, RefreshCw } from "lucide-react";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

import EditPostDialog from "../components/posts/EditPostDialog";
import DeletePostDialog from "../components/posts/DeletePostDialog";
import CancelScheduledPostDialog from "../components/posts/CancelScheduledPostDialog";

import usePostStore from "../stores/post.store";
import useWorkspaceStore from "../stores/workspace.store";
import CreatePostDialog from "../components/posts/CreatePostDialog";

export default function PostsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const posts = usePostStore((state) => state.posts);
  const isLoading = usePostStore((state) => state.isLoading);
  const error = usePostStore((state) => state.error);
  const fetchPosts = usePostStore((state) => state.fetchPosts);

  useEffect(() => {
    if (currentWorkspace?.slug) {
      void fetchPosts(currentWorkspace.slug).catch(() => {});
    }
  }, [currentWorkspace?.slug, fetchPosts]);

  if (!currentWorkspace) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">No workspace selected</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Select a workspace to manage posts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>

          <p className="text-sm text-muted-foreground">
            Manage posts in {currentWorkspace.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              void fetchPosts(currentWorkspace.slug).catch(() => {})
            }
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <CreatePostDialog />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading posts...
          </CardContent>
        </Card>
      ) : error ? (
        /* Error State */
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>

            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                void fetchPosts(currentWorkspace.slug).catch(() => {})
              }
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-4 h-10 w-10 text-muted-foreground" />

            <h2 className="text-lg font-semibold">No posts yet</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Create your first post to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Posts List */
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="space-y-4 pt-6">
                {/* Post Header */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {post.socialAccount.platform}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {post.socialAccount.accountName}
                    </p>
                  </div>

                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {post.status}
                  </span>
                </div>

                {/* Post Content */}
                <p className="whitespace-pre-wrap break-words text-sm">
                  {post.content}
                </p>

                {/* Post Date */}
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Created: {new Date(post.createdAt).toLocaleString()}</p>

                  {post.scheduledAt && (
                    <p>
                      Scheduled: {new Date(post.scheduledAt).toLocaleString()}
                    </p>
                  )}

                  {post.publishedAt && (
                    <p>
                      Published: {new Date(post.publishedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Draft Actions */}
                {post.status === "DRAFT" && (
                  <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                    <EditPostDialog post={post} />
                    <DeletePostDialog post={post} />
                  </div>
                )}

                {/* Scheduled Actions */}
                {post.status === "SCHEDULED" && (
                  <div className="flex items-center gap-2 border-t pt-3">
                    <CancelScheduledPostDialog post={post} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
