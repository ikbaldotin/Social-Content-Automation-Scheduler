import { Job, Worker, DelayedError } from "bullmq";
import { randomUUID } from "node:crypto";
import { prisma } from "../utils/prisma";
import publishPost from "../providers/mock.provider";
import redis from "../config/redis";
interface PublishJobData {
  postId: string;
  scheduleVersion: number;
}
const LOCK_DURATION = 2 * 60 * 1000;
const LOCK_RENEW_INTERVAL = 30 * 1000;
const processPublishJob = async (job: Job<PublishJobData>, token?: string) => {
  const { postId, scheduleVersion } = job.data;
  const totalAttempts = Number(job.opts.attempts ?? 1);
  const isFinalAttempt = job.attemptsMade + 1 >= totalAttempts;
  const jobAttempt = job.attemptsMade + 1;
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
  const lockToken = randomUUID();
  const now = new Date();
  const lockExpiresAt = new Date(now.getTime() + LOCK_DURATION);
  const claimedPost = await prisma.post.updateMany({
    where: {
      id: post.id,
      scheduleVersion,
      status: {
        in: ["SCHEDULED", "PUBLISHING"],
      },
      OR: [
        {
          publishingLockToken: null,
        },
        {
          publishingLockExpiresAt: { lte: now },
        },
      ],
    },
    data: {
      status: "PUBLISHING",
      publishingLockToken: lockToken,
      publishingLockExpiresAt: lockExpiresAt,
    },
  });
  if (claimedPost.count === 0) {
    console.log("Another worker owns this post. Delaying job.");
    if (!token) {
      throw new Error("BullMQ lock token is missing.");
    }
    const currentPost = await prisma.post.findUnique({
      where: {
        id: post.id,
      },
      select: {
        publishingLockExpiresAt: true,
      },
    });
    const retryAt =
      currentPost?.publishingLockExpiresAt?.getTime() ?? Date.now() + 5000;
    await job.moveToDelayed(Math.max(Date.now() + 1000, retryAt), token);
    throw new DelayedError();
  }
  console.log(`Publishing lock acquired for post ${postId}`);
  const lockInterval = setInterval(() => {
    void prisma.post
      .updateMany({
        where: {
          id: post.id,
          scheduleVersion,
          status: "PUBLISHING",
          publishingLockToken: lockToken,
        },
        data: {
          publishingLockExpiresAt: new Date(Date.now() + LOCK_DURATION),
        },
      })
      .then((result) => {
        if (result.count === 0) {
          console.error(`Publishing lock lost for post ${post.id}`);
        }
      })
      .catch((error) => {
        console.error("Publishing lock renewal failed:", error);
      });
  }, LOCK_RENEW_INTERVAL);

  try {
    if (!post.socialAccount.isActive) {
      throw new Error("Social account is inactive");
    }
    const currentAttempt =
      (await prisma.publishAttempt.count({
        where: {
          postId: post.id,
        },
      })) + 1;

    console.log(
      `Publishing post ${post.id} | Job attempt ${jobAttempt}/${totalAttempts} | History attempt ${currentAttempt}`,
    );
    const result = await publishPost({
      postId: post.id,
      content: post.content,
      platform: post.socialAccount.platform,
      accountName: post.socialAccount.accountName,
    });
    if (!result.success) {
      throw new Error(result.message || "Provider failed to publish post");
    }
    await prisma.$transaction(async (tx) => {
      const updatePost = await tx.post.updateMany({
        where: {
          id: post.id,
          status: "PUBLISHING",
          scheduleVersion,
          publishingLockToken: lockToken,
        },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          publishingLockToken: null,
          publishingLockExpiresAt: null,
        },
      });
      if (updatePost.count === 0) {
        throw new Error("Publishing lock lost. Cannot update post.");
      }
      await tx.publishAttempt.create({
        data: {
          postId: post.id,
          attemptNo: currentAttempt,
          success: true,
        },
      });
      console.log(`Post ${post.id} published successfully.`);
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown publishing error";

    console.error(`Publishing failed for post ${postId}:`, errorMessage);
    await prisma.$transaction(async (tx) => {
      const ownedPost = await tx.post.updateMany({
        where: {
          id: post.id,
          status: "PUBLISHING",
          scheduleVersion,
          publishingLockToken: lockToken,
        },
        data: {
          status: isFinalAttempt ? "FAILED" : "PUBLISHING",
          publishingLockToken: null,
          publishingLockExpiresAt: null,
        },
      });
      if (ownedPost.count === 0) {
        console.error("Lock lost. Cannot record this worker's failure.");
        return;
      }
      const currentAttempt =
        (await tx.publishAttempt.count({
          where: {
            postId,
          },
        })) + 1;
      await tx.publishAttempt.create({
        data: {
          postId,
          attemptNo: currentAttempt,
          success: false,
          error: errorMessage,
        },
      });
    });
    if (isFinalAttempt) {
      console.error(`Post ${postId} permanently failed.`);
    } else {
      console.log(`BullMQ will retry post ${postId}.`);
    }
    throw error;
  } finally {
    clearInterval(lockInterval);
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
console.log("Publish worker started.");
export default publishWorker;
