import { useEffect, useMemo, useState } from "react";
import { FileText, RefreshCw } from "lucide-react";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

import EditPostDialog from "../components/posts/EditPostDialog";
import DeletePostDialog from "../components/posts/DeletePostDialog";
import CancelScheduledPostDialog from "../components/posts/CancelScheduledPostDialog";
import CreatePostDialog from "../components/posts/CreatePostDialog";
import ReschedulePostDialog from "../components/posts/ReschedulePostDialog";
import PostDetailsDialog from "../components/posts/PostDetailsDialog";

import usePostStore from "../stores/post.store";
import useWorkspaceStore from "../stores/workspace.store";

type PostStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "FAILED"
  | "CANCELLED";

type PostFilter = "ALL" | PostStatus;

const filters: { label: string; value: PostFilter }[] = [
  { label: "All Posts", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Publishing", value: "PUBLISHING" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
];

// Status badge styles
function getStatusStyles(status: PostStatus): string {
  const styles: Record<PostStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",

    SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",

    PUBLISHING:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",

    PUBLISHED:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",

    FAILED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",

    CANCELLED:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  };

  return styles[status];
}

export default function PostsPage() {
  const [activeFilter, setActiveFilter] = useState<PostFilter>("ALL");

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

  // Filter posts by selected status
  const filteredPosts = useMemo(() => {
    if (activeFilter === "ALL") {
      return posts;
    }

    return posts.filter((post) => post.status === activeFilter);
  }, [posts, activeFilter]);

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

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            size="sm"
            variant={activeFilter === filter.value ? "default" : "outline"}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}

            <span className="ml-2 text-xs opacity-70">
              {filter.value === "ALL"
                ? posts.length
                : posts.filter((post) => post.status === filter.value).length}
            </span>
          </Button>
        ))}
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
      ) : filteredPosts.length === 0 ? (
        /* No Matching Posts State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-4 h-10 w-10 text-muted-foreground" />

            <h2 className="text-lg font-semibold">
              No {activeFilter.toLowerCase()} posts
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              There are no posts with this status.
            </p>

            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setActiveFilter("ALL")}
            >
              Show all posts
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Filtered Posts List */
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPosts.map((post) => (
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

                  {/* Colored Status Badge */}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles(
                      post.status,
                    )}`}
                  >
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

                {/* View Post Details */}
                <div className="border-t pt-3">
                  <PostDetailsDialog slug={currentWorkspace.slug} post={post} />
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
                    <ReschedulePostDialog
                      slug={currentWorkspace.slug}
                      postId={post.id}
                      scheduledAt={post.scheduledAt}
                    />

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
