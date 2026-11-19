import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import CreatePostDialog from "../components/posts/CreatePostDialog";
import CancelScheduledPostDialog from "../components/posts/CancelScheduledPostDialog";
import ReschedulePostDialog from "../components/posts/ReschedulePostDialog";
import useWorkspaceStore from "../stores/workspace.store";
import usePostStore from "../stores/post.store";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function CalendarPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const { posts, fetchPosts, isLoading } = usePostStore();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const workspaceSlug = currentWorkspace?.slug;

  // Fetch posts whenever the selected workspace changes.
  useEffect(() => {
    if (workspaceSlug) {
      fetchPosts(workspaceSlug);
      setSelectedPostId(null);
    }
  }, [workspaceSlug, fetchPosts]);

  // Generate calendar dates for the selected month.
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(year, month, 1 - firstDay.getDay());

    const totalDays =
      Math.ceil((firstDay.getDay() + lastDay.getDate()) / 7) * 7;

    return Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);

      return date;
    });
  }, [currentDate]);

  // Filter scheduled posts.
  const scheduledPosts = useMemo(() => {
    return posts.filter(
      (post) => post.status === "SCHEDULED" && post.scheduledAt,
    );
  }, [posts]);

  // Filter draft posts.
  const draftPosts = useMemo(() => {
    return posts.filter((post) => post.status === "DRAFT");
  }, [posts]);

  // Group scheduled posts by date.
  const postsByDate = useMemo(() => {
    const grouped: Record<string, typeof scheduledPosts> = {};

    scheduledPosts.forEach((post) => {
      const dateKey = getDateKey(new Date(post.scheduledAt!));

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(post);
    });

    return grouped;
  }, [scheduledPosts]);

  // Find selected post.
  const selectedPost = posts.find((post) => post.id === selectedPostId);

  // Navigate between months.
  const changeMonth = (direction: number) => {
    setCurrentDate((previous) => {
      return new Date(
        previous.getFullYear(),
        previous.getMonth() + direction,
        1,
      );
    });

    setSelectedPostId(null);
  };

  // Return to current month.
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedPostId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page heading and Create Post */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Content Calendar
          </h1>

          <p className="text-muted-foreground">
            Plan and manage your upcoming social media posts.
          </p>
        </div>

        {workspaceSlug && <CreatePostDialog />}
      </div>

      {/* Monthly Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />

            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {!workspaceSlug ? (
            <p className="py-10 text-center text-muted-foreground">
              Select a workspace to view its content calendar.
            </p>
          ) : isLoading ? (
            <p className="py-10 text-center text-muted-foreground">
              Loading calendar...
            </p>
          ) : (
            <div className="grid grid-cols-7 border-l border-t">
              {/* Weekday headings */}
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="border-b border-r bg-muted/50 p-2 text-center text-sm font-medium"
                >
                  {day}
                </div>
              ))}

              {/* Calendar dates */}
              {calendarDays.map((date) => {
                const dateKey = getDateKey(date);
                const dayPosts = postsByDate[dateKey] ?? [];

                const isCurrentMonth =
                  date.getMonth() === currentDate.getMonth();

                const isToday = dateKey === getDateKey(new Date());

                return (
                  <div
                    key={dateKey}
                    className={`min-h-32 border-b border-r p-2 ${
                      !isCurrentMonth ? "bg-muted/20" : ""
                    }`}
                  >
                    <div className="mb-2 flex justify-end">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                          isToday
                            ? "bg-primary text-primary-foreground"
                            : isCurrentMonth
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {dayPosts.map((post) => (
                        <button
                          key={post.id}
                          type="button"
                          onClick={() => setSelectedPostId(post.id)}
                          className={`w-full rounded-md px-2 py-1 text-left text-xs transition-colors ${
                            selectedPostId === post.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900"
                          }`}
                        >
                          <span className="block truncate font-medium">
                            {post.socialAccount.platform}
                          </span>

                          <span className="block truncate">
                            {new Date(post.scheduledAt!).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              },
                            )}
                            {" · "}
                            {post.content}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Scheduled Post */}
      {selectedPost && selectedPost.status === "SCHEDULED" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Scheduled Post</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap text-sm">
              {selectedPost.content}
            </p>

            <div className="text-sm text-muted-foreground">
              Platform: {selectedPost.socialAccount.platform}
            </div>

            <div className="text-sm text-muted-foreground">
              Scheduled: {new Date(selectedPost.scheduledAt!).toLocaleString()}
            </div>

            <div className="flex flex-wrap gap-2">
              {workspaceSlug && (
                <ReschedulePostDialog
                  slug={workspaceSlug}
                  postId={selectedPost.id}
                  scheduledAt={selectedPost.scheduledAt}
                />
              )}

              <CancelScheduledPostDialog post={selectedPost} />

              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedPostId(null)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Draft Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Draft Posts</span>

            <span className="text-sm font-normal text-muted-foreground">
              {draftPosts.length} draft(s)
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {!workspaceSlug ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Select a workspace to view draft posts.
            </p>
          ) : isLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Loading drafts...
            </p>
          ) : draftPosts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No draft posts available.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {draftPosts.map((post) => (
                <div key={post.id} className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-yellow-600">
                      DRAFT
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {post.socialAccount.platform}
                    </span>
                  </div>

                  <p className="line-clamp-3 text-sm">{post.content}</p>

                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled post count */}
      <p className="text-sm text-muted-foreground">
        {scheduledPosts.length} scheduled post(s) in this workspace.
      </p>
    </div>
  );
}

export default CalendarPage;
