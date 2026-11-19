import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  BarChart3,
} from "lucide-react";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import useWorkspaceStore from "../stores/workspace.store";
import usePostStore from "../stores/post.store";

type DateRange = 7 | 30 | 90;

export default function AnalyticsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const posts = usePostStore((state) => state.posts);
  const isLoading = usePostStore((state) => state.isLoading);
  const error = usePostStore((state) => state.error);
  const fetchPosts = usePostStore((state) => state.fetchPosts);

  const [selectedRange, setSelectedRange] = useState<DateRange>(7);

  useEffect(() => {
    if (currentWorkspace?.slug) {
      fetchPosts(currentWorkspace.slug);
    }
  }, [currentWorkspace?.slug, fetchPosts]);

  const analytics = useMemo(() => {
    // Overview statistics
    const total = posts.length;

    const published = posts.filter(
      (post) => post.status === "PUBLISHED",
    ).length;

    const scheduled = posts.filter(
      (post) => post.status === "SCHEDULED",
    ).length;

    const failed = posts.filter((post) => post.status === "FAILED").length;

    const publishing = posts.filter(
      (post) => post.status === "PUBLISHING",
    ).length;

    // Publishing performance
    const completed = published + failed;

    const successRate = completed > 0 ? (published / completed) * 100 : 0;

    const failureRate = completed > 0 ? (failed / completed) * 100 : 0;

    // Platform statistics
    const instagram = posts.filter(
      (post) => post.socialAccount?.platform === "INSTAGRAM",
    ).length;

    const facebook = posts.filter(
      (post) => post.socialAccount?.platform === "FACEBOOK",
    ).length;

    const linkedin = posts.filter(
      (post) => post.socialAccount?.platform === "LINKEDIN",
    ).length;

    // Publishing activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rangeStart = new Date(today);
    rangeStart.setDate(today.getDate() - selectedRange + 1);

    const rangeEnd = new Date(today);
    rangeEnd.setDate(today.getDate() + 1);

    // Daily buckets for 7 days, weekly buckets for 30 and 90 days.
    const bucketDays = selectedRange === 7 ? 1 : 7;
    const bucketCount = Math.ceil(selectedRange / bucketDays);

    const activity = Array.from({ length: bucketCount }, (_, index) => {
      const start = new Date(rangeStart);
      start.setDate(rangeStart.getDate() + index * bucketDays);

      const end = new Date(start);
      end.setDate(start.getDate() + bucketDays);

      const bucketEnd = end < rangeEnd ? end : rangeEnd;

      const count = posts.filter((post) => {
        if (post.status !== "PUBLISHED" || !post.publishedAt) {
          return false;
        }

        const publishedDate = new Date(post.publishedAt);

        return (
          !Number.isNaN(publishedDate.getTime()) &&
          publishedDate >= start &&
          publishedDate < bucketEnd
        );
      }).length;

      return {
        label:
          selectedRange === 7
            ? start.toLocaleDateString("en-IN", {
                weekday: "short",
              })
            : start.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              }),
        date: start.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        count,
      };
    });

    const maxActivity = Math.max(...activity.map((item) => item.count), 1);

    return {
      total,
      published,
      scheduled,
      failed,
      publishing,
      completed,
      successRate,
      failureRate,
      instagram,
      facebook,
      linkedin,
      activity,
      maxActivity,
    };
  }, [posts, selectedRange]);

  const statCards = [
    {
      title: "Total Posts",
      value: analytics.total,
      description: "All workspace posts",
      icon: FileText,
      iconClass: "text-primary bg-primary/10",
    },
    {
      title: "Published",
      value: analytics.published,
      description: "Successfully published",
      icon: CheckCircle2,
      iconClass: "text-green-600 bg-green-500/10",
    },
    {
      title: "Scheduled",
      value: analytics.scheduled,
      description: "Waiting to be published",
      icon: Clock,
      iconClass: "text-blue-600 bg-blue-500/10",
    },
    {
      title: "Failed",
      value: analytics.failed,
      description: "Publishing failed",
      icon: AlertCircle,
      iconClass: "text-destructive bg-destructive/10",
    },
  ];

  const platforms = [
    {
      name: "Instagram",
      count: analytics.instagram,
      color: "bg-pink-500",
    },
    {
      name: "Facebook",
      count: analytics.facebook,
      color: "bg-blue-600",
    },
    {
      name: "LinkedIn",
      count: analytics.linkedin,
      color: "bg-sky-600",
    },
  ];

  if (!currentWorkspace) {
    return (
      <div className="py-16 text-center">
        <h2 className="font-semibold">No workspace selected</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Select a workspace to view analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>

          <p className="text-sm text-muted-foreground">
            Publishing overview for {currentWorkspace.name}.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => fetchPosts(currentWorkspace.slug)}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <p className="text-sm text-destructive">{error}</p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPosts(currentWorkspace.slug)}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>

                <div className={`rounded-lg p-2 ${stat.iconClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : stat.value}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Publishing Summary */}
      {!isLoading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Publishing Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Published posts</span>

              <span className="font-medium">
                {analytics.published} / {analytics.total}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{
                  width: `${
                    analytics.total > 0
                      ? (analytics.published / analytics.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {analytics.total > 0
                ? `${((analytics.published / analytics.total) * 100).toFixed(
                    1,
                  )}% of all posts are published.`
                : "Create posts to start seeing publishing statistics."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Publishing Performance */}
      {!isLoading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Publishing Performance
            </CardTitle>

            <CardDescription>
              Success and failure rates for completed posts.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Success Rate</span>

                <span className="font-semibold text-green-600">
                  {analytics.successRate.toFixed(1)}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${analytics.successRate}%`,
                  }}
                />
              </div>
            </div>

            {/* Failure Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Failure Rate</span>

                <span className="font-semibold text-destructive">
                  {analytics.failureRate.toFixed(1)}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-destructive transition-all"
                  style={{
                    width: `${analytics.failureRate}%`,
                  }}
                />
              </div>
            </div>

            {/* Outcome Counts */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>

                <p className="text-2xl font-bold">{analytics.published}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Failed</p>

                <p className="text-2xl font-bold">{analytics.failed}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Based on {analytics.completed} completed publishing outcomes.
              Draft, scheduled, and currently publishing posts are excluded.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Platform Analytics */}
      {!isLoading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Platform Analytics
            </CardTitle>

            <CardDescription>
              Distribution of posts across social platforms.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {platforms.map((platform) => {
              const percentage =
                analytics.total > 0
                  ? (platform.count / analytics.total) * 100
                  : 0;

              return (
                <div key={platform.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{platform.name}</span>

                    <span className="text-sm text-muted-foreground">
                      {platform.count} posts ({percentage.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${platform.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Publishing Activity */}
      {!isLoading && !error && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Publishing Activity</CardTitle>

                <CardDescription>
                  Successfully published posts over the last {selectedRange}{" "}
                  days.
                </CardDescription>
              </div>

              <div className="flex gap-2">
                {([7, 30, 90] as const).map((days) => (
                  <Button
                    key={days}
                    size="sm"
                    variant={selectedRange === days ? "default" : "outline"}
                    onClick={() => setSelectedRange(days)}
                  >
                    {days} Days
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex h-56 items-end justify-between gap-3 border-b pb-2">
              {analytics.activity.map((item) => {
                const height =
                  item.count > 0
                    ? Math.max((item.count / analytics.maxActivity) * 100, 5)
                    : 0;

                return (
                  <div
                    key={item.date}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-xs font-medium">{item.count}</span>

                    <div className="flex h-full w-full items-end justify-center">
                      <div
                        className="w-full max-w-12 rounded-t-md bg-primary transition-all"
                        style={{
                          height: `${height}%`,
                          minHeight: item.count > 0 ? "4px" : "0px",
                        }}
                        title={`${item.date}: ${item.count} published posts`}
                      />
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Only successfully published posts are included.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && posts.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

            <p className="font-medium">No post data available</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Create your first post to see analytics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
