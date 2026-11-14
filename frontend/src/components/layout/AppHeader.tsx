import { Bell, ChevronDown } from "lucide-react";

import { Button } from "../ui/button";
import ThemeToggle from "./ThemeToggle";

export default function AppHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div>
        <p className="text-sm text-muted-foreground">Workspace</p>
        <Button variant="ghost" className="h-auto p-0 font-semibold">
          My Workspace
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          IK
        </div>
      </div>
    </header>
  );
}
