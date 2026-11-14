import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const posts = [
  {
    id: 1,
    content: "Introducing our new product!",
    platform: "Instagram",
    status: "Published",
    date: "Nov 14, 2026",
  },
  {
    id: 2,
    content: "5 tips for growing your business",
    platform: "Instagram",
    status: "Scheduled",
    date: "Nov 15, 2026",
  },
  {
    id: 3,
    content: "Our latest company update",
    platform: "LinkedIn",
    status: "Failed",
    date: "Nov 13, 2026",
  },
];

export default function RecentPosts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Posts</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-5">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-col gap-2 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{post.content}</p>
                <p className="text-xs text-muted-foreground">
                  {post.platform} · {post.date}
                </p>
              </div>

              <Badge
                variant={
                  post.status === "Published"
                    ? "default"
                    : post.status === "Failed"
                      ? "destructive"
                      : "secondary"
                }
                className="w-fit"
              >
                {post.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
