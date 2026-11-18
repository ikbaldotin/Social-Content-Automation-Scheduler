import { useEffect } from "react";
import { Camera, RefreshCw, Unplug } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";

import DisconnectAccountDialog from "../components/social-accounts/DisconnectAccountDialog";

import useWorkspaceStore from "../stores/workspace.store";
import useSocialAccountStore from "../stores/social-account.store";

export default function SocialAccountsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const socialAccounts = useSocialAccountStore((state) => state.socialAccounts);

  const isLoading = useSocialAccountStore((state) => state.isLoading);

  const isConnecting = useSocialAccountStore((state) => state.isConnecting);

  const error = useSocialAccountStore((state) => state.error);

  const fetchSocialAccounts = useSocialAccountStore(
    (state) => state.fetchSocialAccounts,
  );

  const connectInstagram = useSocialAccountStore(
    (state) => state.connectInstagram,
  );

  useEffect(() => {
    if (currentWorkspace?.slug) {
      void fetchSocialAccounts(currentWorkspace.slug).catch(() => {});
    }
  }, [currentWorkspace?.slug, fetchSocialAccounts]);

  const handleConnectInstagram = async () => {
    if (!currentWorkspace) {
      toast.error("Please select a workspace first");
      return;
    }

    try {
      await connectInstagram(currentWorkspace.id);

      await fetchSocialAccounts(currentWorkspace.slug);

      toast.success("Instagram connected successfully");
    } catch {
      toast.error(
        "Failed to connect Instagram. Please check your configuration.",
      );
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">No workspace selected</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Select a workspace to manage social accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Social Accounts</h1>

          <p className="text-sm text-muted-foreground">
            Manage connected accounts in {currentWorkspace.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              void fetchSocialAccounts(currentWorkspace.slug).catch(() => {})
            }
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button onClick={handleConnectInstagram} disabled={isConnecting}>
            <Camera className="mr-2 h-4 w-4" />
            {isConnecting ? "Connecting..." : "Connect Instagram"}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>

            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() =>
                void fetchSocialAccounts(currentWorkspace.slug).catch(() => {})
              }
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading social accounts...
          </CardContent>
        </Card>
      ) : socialAccounts.length === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Unplug className="mb-4 h-10 w-10 text-muted-foreground" />

            <h2 className="text-lg font-semibold">No connected accounts</h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Connect your Instagram account to start managing and publishing
              posts from this workspace.
            </p>

            <Button
              className="mt-5"
              onClick={handleConnectInstagram}
              disabled={isConnecting}
            >
              <Camera className="mr-2 h-4 w-4" />
              {isConnecting ? "Connecting..." : "Connect Instagram"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Connected Accounts */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {socialAccounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Camera className="h-6 w-6" />

                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                    Connected
                  </span>
                </div>

                <CardTitle className="pt-3">{account.accountName}</CardTitle>

                <CardDescription>{account.platform}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Account ID: {account.accountId}
                </p>

                <DisconnectAccountDialog
                  accountId={account.id}
                  accountName={account.accountName}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
