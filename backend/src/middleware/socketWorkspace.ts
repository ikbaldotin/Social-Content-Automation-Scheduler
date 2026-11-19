import { prisma } from "../utils/prisma";
import type { AuthenticatedSocket } from "./socketAuth";

export const joinWorkspace = async (
  socket: AuthenticatedSocket,
  workspaceId: string,
) => {
  try {
    if (!socket.userId) {
      socket.emit("workspace:error", {
        message: "Authentication required",
      });
      return;
    }

    if (!workspaceId || typeof workspaceId !== "string") {
      socket.emit("workspace:error", {
        message: "Invalid workspace ID",
      });
      return;
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: socket.userId,
          workspaceId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!membership) {
      socket.emit("workspace:error", {
        message: "You are not a member of this workspace",
      });
      return;
    }

    await socket.join(`workspace:${workspaceId}`);

    socket.emit("workspace:joined", {
      workspaceId,
      message: "Successfully joined workspace",
    });
  } catch (error) {
    console.error("Workspace join error:", error);

    socket.emit("workspace:error", {
      message: "Unable to join workspace",
    });
  }
};
