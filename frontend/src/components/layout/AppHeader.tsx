import { Bell, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "../ui/button";
import ThemeToggle from "./ThemeToggle";
import CreateWorkspaceDialog from "../workspace/CreateWorkspaceDialog";

import useAuthStore from "../../stores/auth.store";
import useWorkspaceStore from "../../stores/workspace.store";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function AppHeader() {
  const navigate = useNavigate();

  // Authentication state
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  // Workspace state
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const selectWorkspace = useWorkspaceStore((state) => state.selectWorkspace);

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      {/* Workspace section */}
      <div>
        <p className="text-sm text-muted-foreground">Workspace</p>

        <div className="flex items-center gap-3">
          {/* Workspace selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-semibold">
              {currentWorkspace?.name ?? "Select Workspace"}
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              {workspaces.length > 0 ? (
                workspaces.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => selectWorkspace(workspace)}
                  >
                    {workspace.name}
                    {currentWorkspace?.id === workspace.id && " ✓"}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  No workspaces found
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create workspace dialog */}
          <CreateWorkspaceDialog />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        {/* User avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        {/* Logout */}
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
