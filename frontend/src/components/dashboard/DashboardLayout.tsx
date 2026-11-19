import { Outlet } from "react-router";
import { useEffect } from "react";

import AppSidebar from "../layout/AppSidebar";
import AppHeader from "../layout/AppHeader";

import useWorkspaceStore from "../../stores/workspace.store";
import usePostStore from "../../stores/post.store";

import { socket } from "../../lib/socket";

export default function DashboardLayout() {
  const fetchWorkspaces = useWorkspaceStore((state) => state.fetchWorkspaces);

  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const fetchPosts = usePostStore((state) => state.fetchPosts);

  // Fetch workspaces when dashboard mounts.
  useEffect(() => {
    void fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Manage Socket.IO connection.
  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
    };

    const handleConnectError = (error: Error) => {
      console.error("Socket connection error:", error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, []);

  // Join and leave the selected workspace room.
  useEffect(() => {
    if (!currentWorkspace?.id) return;

    const joinRoom = () => {
      socket.emit("workspace:join", currentWorkspace.id);
    };

    const handleJoined = (data: { workspaceId: string; message: string }) => {
      console.log("Workspace joined:", data.message);
    };

    const handleError = (data: { message: string }) => {
      console.error("Workspace error:", data.message);
    };

    socket.on("connect", joinRoom);
    socket.on("workspace:joined", handleJoined);
    socket.on("workspace:error", handleError);

    if (socket.connected) {
      joinRoom();
    }

    return () => {
      socket.off("connect", joinRoom);
      socket.off("workspace:joined", handleJoined);
      socket.off("workspace:error", handleError);

      if (socket.connected) {
        socket.emit("workspace:leave", currentWorkspace.id);
      }
    };
  }, [currentWorkspace?.id]);

  // Listen for real-time publishing status updates.
  useEffect(() => {
    if (!currentWorkspace?.id || !currentWorkspace?.slug) {
      return;
    }

    const handlePostStatusUpdate = (data: {
      postId: string;
      workspaceId: string;
      status: string;
      publishedAt?: string;
    }) => {
      // Ignore events from other workspaces.
      if (data.workspaceId !== currentWorkspace.id) {
        return;
      }

      console.log("Post status updated:", data);

      // Refresh posts from the backend.
      void fetchPosts(currentWorkspace.slug);
    };

    socket.on("post:status-updated", handlePostStatusUpdate);

    return () => {
      socket.off("post:status-updated", handlePostStatusUpdate);
    };
  }, [currentWorkspace?.id, currentWorkspace?.slug, fetchPosts]);

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
