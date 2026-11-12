import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from "./routers/auth.route";
import wokspaceRouter from "./routers/workspace.route";
import membershipRouter from "./routers/membership.route";
import socialAccountRouter from "./routers/social-account.route";
import postRouter from "./routers/post.route";
import mediaRouter from "./routers/media.route";
import scheduleRouter from "./routers/schedule.route";
import { createServer } from "http";
import publishQueue from "./queues/publish.queue";
import redis from "./config/redis";
import { prisma } from "./utils/prisma";
import publishWorker from "./workers/publish.worker";
dotenv.config();
const app = express();
const server = createServer(app);
app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT;
app.use("/api/auth", authRouter);
app.use("/api/workspace", wokspaceRouter);
app.use("/api/membership", membershipRouter);
app.use("/api/social", socialAccountRouter);
app.use("/api/post", postRouter);
app.use("/api/media", mediaRouter);
app.use("/api/schedule", scheduleRouter);
server.listen(port, () => {
  console.log(`Sever is running on port ${port}`);
});

let isShuttingDown = false;
const shutdown = async (signal: string) => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  console.log(`${signal} received. Starting graceful shutdown...`);

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    console.log("HTTP server closed.");
  } catch (error) {
    console.error("HTTP server shutdown error:", error);
  }

  try {
    await publishWorker.close();
    console.log("Publish worker closed.");
  } catch (error) {
    console.error("Worker shutdown error:", error);
  }

  try {
    await publishQueue.close();
    console.log("Publish queue closed.");
  } catch (error) {
    console.error("Queue shutdown error:", error);
  }

  try {
    await redis.quit();
    console.log("Redis connection closed.");
  } catch (error) {
    console.error("Redis shutdown error:", error);
  }

  try {
    await prisma.$disconnect();
    console.log("Prisma disconnected.");
  } catch (error) {
    console.error("Prisma shutdown error:", error);
  }
  console.log("Graceful shutdown completed.");
  process.exit(0);
};

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});
