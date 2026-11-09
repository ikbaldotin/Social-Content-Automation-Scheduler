import { Request, Response } from "express";
import { schedulePostSchema } from "../validate/schedule.schema";
import { prisma } from "../utils/prisma";
import publishQueue from "../queues/publish.queue";

const schedulePost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    const postId = req.params.id as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = schedulePostSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        errors: result.error.issues,
      });
    }
    const scheduledAt = new Date(result.data.scheduledAt);
    if (scheduledAt.getTime() <= Date.now()) {
      return res.status(400).json({
        message: "Scheduled time must be in the future",
      });
    }
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        workspace: {
          slug,
          memberships: {
            some: { userId },
          },
        },
      },
    });
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
    if (post.userId !== userId) {
      return res.status(403).json({
        message: "You can only schedule your own posts",
      });
    }
    if (post.status !== "DRAFT") {
      return res.status(400).json({
        message: "Only draft posts can be scheduled",
      });
    }
    const updatedPost = await prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        status: "SCHEDULED",
        scheduledAt,
        scheduleVersion: {
          increment: 1,
        },
      },
    });
    const delay = Math.max(0, scheduledAt.getTime() - Date.now());
    await publishQueue.add(
      "publish",
      {
        postId: updatedPost.id,
        scheduleVersion: updatedPost.scheduleVersion,
      },
      {
        delay,
        jobId: `post-${updatedPost.id}-v${updatedPost.scheduleVersion}`,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
    return res.status(200).json({
      message: "Post scheduled successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("schedulePost error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const cancelScheduledPost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    const postId = req.params.id as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        workspace: {
          slug,
          memberships: {
            some: { userId },
          },
        },
      },
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId !== userId) {
      return res.status(403).json({
        message: "You can only cancel your own posts",
      });
    }
    if (post.status !== "SCHEDULED") {
      return res.status(400).json({
        message: "Only scheduled posts can be cancelled",
      });
    }
    const cancelledPost = await prisma.post.updateMany({
      where: {
        id: post.id,
        userId,
        status: "SCHEDULED",
        scheduleVersion: post.scheduleVersion,
      },
      data: {
        status: "CANCELLED",
        scheduleVersion: {
          increment: 1,
        },
      },
    });
    if (cancelledPost.count === 0) {
      return res.status(409).json({
        message: "Post could not be cancelled. Its status may have changed.",
      });
    }
    const jobId = `post-${post.id}-v${post.scheduleVersion}`;
    try {
      const job = await publishQueue.getJob(jobId);
      if (job) {
        await job.remove();
      }
    } catch (error) {
      console.log("Could not remove BullMQ job:", error);
      return res.status(200).json({
        message: "Post cancelled successfully",
        postId: post.id,
        status: "CANCELLED",
      });
    }
  } catch (error) {
    console.error("cancelScheduledPost error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const reschedulePost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    const postId = req.params.id as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = schedulePostSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        errors: result.error.issues,
      });
    }
    const scheduledAt = new Date(result.data.scheduledAt);
    if (scheduledAt.getTime() <= Date.now()) {
      return res.status(400).json({
        message: "Scheduled time must be in the future",
      });
    }
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        workspace: {
          slug,
          memberships: {
            some: { userId },
          },
        },
      },
    });
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
    if (post.userId !== userId) {
      return res.status(403).json({
        message: "You can only reschedule your own posts",
      });
    }
    if (post.status !== "SCHEDULED") {
      return res.status(400).json({
        message: "Only scheduled posts can be rescheduled",
      });
    }
    const updatedPost = await prisma.post.updateMany({
      where: {
        id: post.id,
        userId,
        status: "SCHEDULED",
        scheduleVersion: post.scheduleVersion,
      },
      data: {
        scheduledAt,
        scheduleVersion: {
          increment: 1,
        },
      },
    });
    if (updatedPost.count === 0) {
      return res.status(409).json({
        message: "Post could not be rescheduled. Its status may have changed.",
      });
    }
    const newPost = await prisma.post.findUnique({
      where: {
        id: post.id,
      },
    });
    if (!newPost) {
      return res.status(404).json({
        message: "Post not found after update",
      });
    }
    const oldJobId = `post-${post.id}-v${post.scheduleVersion}`;
    try {
      const job = await publishQueue.getJob(oldJobId);
      if (job) {
        await job.remove();
      }
    } catch (error) {
      console.log("Could not remove old BullMQ job:", error);
    }
    const delay = Math.max(0, newPost.scheduledAt!.getTime() - Date.now());
    await publishQueue.add(
      "publish",
      {
        postId: newPost.id,
        scheduleVersion: newPost.scheduleVersion,
      },
      {
        delay,
        jobId: `post-${newPost.id}-v${newPost.scheduleVersion}`,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
    return res.status(200).json({
      message: "Post rescheduled successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("reschedulePost error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export { schedulePost, cancelScheduledPost, reschedulePost };
