import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  ChartNoAxesCombined,
  Camera,
  Settings,
  Users,
} from "lucide-react";

import { NavLink } from "react-router";

const navigation = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Posts", icon: FileText, path: "/posts" },
  { title: "Calendar", icon: CalendarDays, path: "/calendar" },
  { title: "Social Accounts", icon: Camera, path: "/social-accounts" },
  { title: "Analytics", icon: ChartNoAxesCombined, path: "/analytics" },
  { title: "Team Members", icon: Users, path: "/team-members" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export default function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar p-4 md:flex">
      <div className="mb-8 px-3">
        <h1 className="text-xl font-bold tracking-tight">
          Social<span className="text-primary">Scheduler</span>
        </h1>
        <p className="text-xs text-muted-foreground">Social Media Scheduler</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t pt-4">
        <p className="px-3 text-xs text-muted-foreground">
          SocialScheduler v1.0
        </p>
      </div>
    </aside>
  );
}
