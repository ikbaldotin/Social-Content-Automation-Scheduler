import { Server } from "socket.io";
import { createServer } from "node:http";
import { createAdapter } from "@socket.io/redis-adapter";
import redis from "./redis";
import env from "./env";
import socketAuth from "../middleware/socketAuth";
import { joinWorkspace } from "../middleware/socketWorkspace";

export function initializeSocket(httpServer: ReturnType<typeof createServer>) {
  const pubClient = redis.duplicate();
  const subClient = redis.duplicate();
  const io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });
  io.adapter(createAdapter(pubClient, subClient));
  io.use(socketAuth);
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on("workspace:join", async (workspaceId: string) => {
      await joinWorkspace(socket, workspaceId);
    });
    socket.on("workspace:leave", async (workspaceId: string) => {
      await socket.leave(`workspace:${workspaceId}`);

      socket.emit("workspace:left", {
        workspaceId,
      });
    });
    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
    });
  });
  return io;
}
