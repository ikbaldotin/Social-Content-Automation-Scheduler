import { Outlet } from "react-router";
import AppSidebar from "../layout/AppSidebar";
import AppHeader from "../layout/AppHeader";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
