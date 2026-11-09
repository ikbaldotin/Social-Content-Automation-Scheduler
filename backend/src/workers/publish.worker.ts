import { Job, Worker } from "bullmq";
import { prisma } from "../utils/prisma";
import publishPost from "../providers/mock.provider";
import redis from "../config/redis";
interface PublishJobData {
  postId: string;
  scheduleVersion: number;
}

const processPublishJob = async (job: Job<PublishJobData>) => {
  const { postId, scheduleVersion } = job.data;
  const totalAttempts = Number(job.opts.attempts ?? 1);
  const currentAttempt = job.attemptsMade + 1;
  console.log(
    `Publishing post ${postId} | Attempt ${currentAttempt}/${totalAttempts}`,
  );
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      socialAccount: true,
    },
  });
  if (!post) {
    console.log("Post not found. Skipping job.");
    return;
  }
  if (post.scheduleVersion !== scheduleVersion) {
    console.log("Stale job (schedule version changed). Skipping.");
    return;
  }
  if (post.status !== "SCHEDULED" && post.status !== "PUBLISHING") {
    console.log(`Post status is ${post.status}. Skipping job.`);
    return;
  }
  if (!post.scheduledAt || post.scheduledAt.getTime() > Date.now()) {
    console.log("Post is not due yet. Skipping job.");
    return;
  }
  if (post.status === "SCHEDULED") {
    const claimedPost = await prisma.post.updateMany({
      where: {
        id: post.id,
        status: "SCHEDULED",
        scheduleVersion,
      },
      data: {
        status: "PUBLISHING",
      },
    });
    if (claimedPost.count === 0) {
      console.log("Post was already claimed or changed. Skipping.");
      return;
    }
  }
  try {
    if (!post.socialAccount.isActive) {
      throw new Error("Social account is inactive");
    }
    const result = await publishPost({
      postId: post.id,
      content: post.content,
      platform: post.socialAccount.platform,
      accountName: post.socialAccount.accountName,
    });
    if (!result.success) {
      throw new Error(result.message || "Provider failed to publish post");
    }
    await prisma.$transaction([
      prisma.publishAttempt.create({
        data: {
          postId: post.id,
          attemptNo: currentAttempt,
          success: true,
        },
      }),
      prisma.post.updateMany({
        where: {
          id: post.id,
          status: "PUBLISHING",
          scheduleVersion,
        },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      }),
    ]);
    console.log(`Post ${postId} published successfully.`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown publishing error";
    const isFinalAttempt = currentAttempt >= totalAttempts;
    console.error(
      `Publishing failed | Attempt ${currentAttempt}/${totalAttempts}`,
      errorMessage,
    );
    await prisma.$transaction([
      prisma.publishAttempt.create({
        data: {
          postId: post.id,
          attemptNo: currentAttempt,
          success: false,
          error: errorMessage,
        },
      }),
      ...(isFinalAttempt
        ? [
            prisma.post.updateMany({
              where: {
                id: post.id,
                status: "PUBLISHING",
                scheduleVersion,
              },
              data: {
                status: "FAILED",
              },
            }),
          ]
        : []),
    ]);
    if (isFinalAttempt) {
      console.error(`Post ${postId} permanently failed.`);
    } else {
      console.log(`BullMQ will retry post ${postId}.`);
    }
    throw error;
  }
};
const publishWorker = new Worker<PublishJobData>(
  "publish-post",
  processPublishJob,
  {
    connection: redis,
    concurrency: 5,
  },
);
publishWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

publishWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

publishWorker.on("error", (error) => {
  console.error("Worker error:", error);
});

const shutdownWorker = async (signal: string) => {
  console.log(`${signal} received. Shutting down publish worker...`);
  try {
    await publishWorker.close();
    console.log("Publish worker closed successfully.");
  } catch (error) {
    console.error("Error while closing publish worker:", error);
  }
};
process.once("SIGTERM", () => {
  void shutdownWorker("SIGTERM");
});
process.once("SIGINT", () => {
  void shutdownWorker("SIGINT");
});
console.log("Publish worker started.");
export default publishWorker;
