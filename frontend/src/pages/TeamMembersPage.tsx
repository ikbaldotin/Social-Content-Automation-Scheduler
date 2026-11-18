import { useEffect } from "react";
import { Users, RefreshCw, UserPlus } from "lucide-react";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

import useWorkspaceStore from "../stores/workspace.store";
import useMembershipStore from "../stores/membership.store";

export default function TeamMembersPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const members = useMembershipStore((state) => state.members);
  const isLoading = useMembershipStore((state) => state.isLoading);
  const error = useMembershipStore((state) => state.error);

  const fetchMembers = useMembershipStore((state) => state.fetchMembers);

  const clearMembers = useMembershipStore((state) => state.clearMembers);

  useEffect(() => {
    if (currentWorkspace?.slug) {
      clearMembers();

      void fetchMembers(currentWorkspace.slug).catch(() => {});
    } else {
      clearMembers();
    }
  }, [currentWorkspace?.slug, fetchMembers, clearMembers]);

  if (!currentWorkspace) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">No workspace selected</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Select a workspace to manage team members.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>

          <p className="text-sm text-muted-foreground">
            Manage members of {currentWorkspace.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              void fetchMembers(currentWorkspace.slug).catch(() => {})
            }
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button disabled>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Member Count */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-secondary p-3">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Members</p>

              <p className="text-2xl font-bold">{members.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading team members...
          </CardContent>
        </Card>
      ) : error ? (
        /* Error State */
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>

            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                void fetchMembers(currentWorkspace.slug).catch(() => {})
              }
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : members.length === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="mb-4 h-10 w-10 text-muted-foreground" />

            <h2 className="text-lg font-semibold">No team members found</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Add members to collaborate in this workspace.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Members List */
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {members.map((member) => {
                const memberName =
                  member.name ?? member.user?.name ?? "Unknown Member";

                const memberEmail =
                  member.email ?? member.user?.email ?? "No email available";

                const initial = memberName.charAt(0).toUpperCase();

                return (
                  <div
                    key={member.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-semibold">
                        {initial}
                      </div>

                      <div>
                        <p className="font-medium">{memberName}</p>

                        <p className="text-xs text-muted-foreground">
                          {memberEmail}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                      {member.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
