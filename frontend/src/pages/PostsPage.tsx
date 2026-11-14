import { useEffect } from "react";
import { FileText, RefreshCw } from "lucide-react";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

import usePostStore from "../stores/post.store";
import useWorkspaceStore from "../stores/workspace.store";

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
        <p className="mt-2 text-muted-foreground">
          Select or create a workspace to view your posts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-sm text-muted-foreground">
            Manage posts in {currentWorkspace.name}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void fetchPosts(currentWorkspace.slug).catch(() => {})}
          disabled={isLoading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-muted-foreground">
          Loading posts...
        </p>
      ) : error ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">{error}</p>
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
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <FileText className="mb-4 h-10 w-10 text-muted-foreground" />
            <h2 className="font-semibold">No posts yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first post for this workspace.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    {post.socialAccount.platform}
                  </span>

                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {post.status}
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-sm">{post.content}</p>

                <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                  <span>{post.socialAccount.accountName}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
