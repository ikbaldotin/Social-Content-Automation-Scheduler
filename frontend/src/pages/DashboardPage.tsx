import {
  FileText,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import StatCard from "../components/dashboard/StatCard";
import RecentPosts from "../components/dashboard/RecentPosts";

const stats = [
  {
    title: "Total Posts",
    value: 48,
    description: "All posts created",
    icon: FileText,
  },
  {
    title: "Scheduled",
    value: 12,
    description: "Waiting to be published",
    icon: CalendarDays,
  },
  {
    title: "Published",
    value: 32,
    description: "Successfully published",
    icon: CheckCircle2,
  },
  {
    title: "Failed",
    value: 4,
    description: "Need your attention",
    icon: AlertCircle,
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back! Here's what's happening with your social accounts.
            </p>
          </div>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <RecentPosts />

          <div className="rounded-xl border p-6">
            <h2 className="font-semibold">Upcoming Schedule</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your upcoming scheduled posts will appear here.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
