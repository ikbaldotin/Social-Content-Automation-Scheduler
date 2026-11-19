import { useEffect } from "react";
import { RefreshCw, Users } from "lucide-react";
import useWorkspaceStore from "../stores/workspace.store";
import useMembershipStore from "../stores/membership.store";
import { Button } from "../components/ui/button";
import AddMemberDialog from "../components/team/AddMemberDialog";
import { Card, CardContent } from "../components/ui/card";
import UpdateMemberRoleDialog from "../components/team/UpdateMemberRoleDialog";
import RemoveMemberDialog from "../components/team/RemoveMemberDialog";

export default function TeamMembersPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const { members, isLoading, error, fetchMembers, clearMembers } =
    useMembershipStore();

  useEffect(() => {
    if (!currentWorkspace?.slug) {
      clearMembers();
      return;
    }

    clearMembers();
    fetchMembers(currentWorkspace.slug);
  }, [currentWorkspace?.slug, fetchMembers, clearMembers]);

  const handleRefresh = () => {
    if (currentWorkspace?.slug) {
      fetchMembers(currentWorkspace.slug);
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="mb-4 h-10 w-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold">No workspace selected</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a workspace to view its team members.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-sm text-muted-foreground">
            Manage members of {currentWorkspace.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="Refresh members"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>

          <AddMemberDialog />
        </div>
      </div>

      {/* Member count */}
      <Card>
        <CardContent className="flex items-center gap-3 p-5">
          <div className="rounded-lg bg-primary/10 p-3">
            <Users className="h-5 w-5 text-primary" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Total members</p>
            <p className="text-2xl font-bold">{members.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Loading team members...
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-sm text-destructive">{error}</p>

            <Button variant="outline" onClick={handleRefresh}>
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !error && members.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground" />

            <h2 className="font-semibold">No team members found</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add members to collaborate in this workspace.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Members list */}
      {!isLoading && !error && members.length > 0 && (
        <Card>
          <CardContent className="divide-y p-0">
            {members.map((member) => {
              const memberName =
                member.name ?? member.user?.name ?? "Unknown Member";

              const memberEmail =
                member.email ?? member.user?.email ?? "No email available";

              const initial = memberName.charAt(0).toUpperCase();

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {initial}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">{memberName}</p>

                      <p className="truncate text-sm text-muted-foreground">
                        {memberEmail}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {member.role}
                  </span>
                  {member.role !== "OWNER" && (
                    <>
                      <UpdateMemberRoleDialog member={member} />
                      <RemoveMemberDialog member={member} />
                    </>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
